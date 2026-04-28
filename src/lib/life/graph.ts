import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { journals, memoryEdges, memoryNodes } from "@/db/schema";
import { extractEntities } from "@/lib/ai/extract";

export type Node =
  | { type: "person"; name: string }
  | { type: "topic"; name: string }
  | { type: "emotion"; name: string }
  | { type: "event"; name: string };

export type Edge = {
  from: string;
  to: string;
  weight: number;
};

type GraphNodeRow = Awaited<ReturnType<typeof db.query.memoryNodes.findMany>>[number];
type GraphEdgeRow = Awaited<ReturnType<typeof db.query.memoryEdges.findMany>>[number];
type JournalRow = Awaited<ReturnType<typeof db.query.journals.findMany>>[number];

type NodeType = Node["type"];

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function createNodeId(userId: string, type: NodeType, name: string) {
  return `${userId}:${type}:${normalizeName(name)}`;
}

function createEdgeId(userId: string, fromKey: string, toKey: string, relation: string) {
  return `${userId}:${fromKey}->${toKey}:${relation}`;
}

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function extractEventLabels(journal: JournalRow) {
  const text = [journal.title, journal.content].filter(Boolean).join(". ");
  const sentences = splitSentences(text);
  const actionVerbs = /\b(worked|met|built|planned|called|shipped|studied|launched|wrote|visited|exercised|traveled|discussed|reflected|decided|finished|started|helped|debugged|design|focus|felt)\b/i;

  const events = unique(sentences.filter((sentence) => actionVerbs.test(sentence)).slice(0, 4));

  if (events.length > 0) {
    return events;
  }

  return unique(sentences.slice(0, 2));
}

function parseWeight(value?: string | null) {
  const parsed = Number.parseFloat(value || "1");
  return Number.isFinite(parsed) ? parsed : 1;
}

function serializeWeight(value: number) {
  return String(Math.max(0.1, Number(value.toFixed(3))));
}

function graphTimestamp(journalDate?: Date | string) {
  return journalDate instanceof Date ? journalDate : journalDate ? new Date(journalDate) : new Date();
}

async function upsertNode(
  userId: string,
  type: NodeType,
  name: string,
  journalDate: Date,
  metadata: Record<string, unknown>
) {
  const normalizedName = normalizeName(name);
  const existing = await db.query.memoryNodes.findFirst({
    where: and(
      eq(memoryNodes.userId, userId),
      eq(memoryNodes.type, type),
      eq(memoryNodes.normalizedName, normalizedName)
    ),
  });

  const baseWeight = parseWeight(existing?.weight);
  const ageFactor = 1 / (Math.max(0, (Date.now() - journalDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const nextWeight = baseWeight + 1 + ageFactor;
  const baseMetadata = existing?.metadata ? safeParseJson(existing.metadata) : {};
  const nextMetadata = {
    ...baseMetadata,
    ...metadata,
    journalIds: unique([...(baseMetadata as any).journalIds || [], ...(metadata as any).journalIds || []]),
    mentions: (baseMetadata as any).mentions ? Number((baseMetadata as any).mentions) + 1 : 1,
  };

  if (existing) {
    await db.update(memoryNodes).set({
      name,
      weight: serializeWeight(nextWeight),
      lastSeenAt: journalDate,
      metadata: JSON.stringify(nextMetadata),
      updatedAt: new Date(),
    }).where(eq(memoryNodes.id, existing.id));
    return;
  }

  await db.insert(memoryNodes).values({
    id: createNodeId(userId, type, name),
    userId,
    type,
    name,
    normalizedName,
    weight: serializeWeight(nextWeight),
    firstSeenAt: journalDate,
    lastSeenAt: journalDate,
    metadata: JSON.stringify({ ...metadata, mentions: 1 }),
  });
}

async function upsertEdge(
  userId: string,
  fromKey: string,
  toKey: string,
  relation: string,
  journalDate: Date,
  metadata: Record<string, unknown>
) {
  const existing = await db.query.memoryEdges.findFirst({
    where: and(
      eq(memoryEdges.userId, userId),
      eq(memoryEdges.fromKey, fromKey),
      eq(memoryEdges.toKey, toKey),
      eq(memoryEdges.relation, relation)
    ),
  });

  const baseWeight = parseWeight(existing?.weight);
  const ageFactor = 1 / (Math.max(0, (Date.now() - journalDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const nextWeight = baseWeight + 1 + ageFactor;
  const baseMetadata = existing?.metadata ? safeParseJson(existing.metadata) : {};
  const nextMetadata = {
    ...baseMetadata,
    ...metadata,
    mentions: (baseMetadata as any).mentions ? Number((baseMetadata as any).mentions) + 1 : 1,
  };

  if (existing) {
    await db.update(memoryEdges).set({
      weight: serializeWeight(nextWeight),
      lastSeenAt: journalDate,
      metadata: JSON.stringify(nextMetadata),
      updatedAt: new Date(),
    }).where(eq(memoryEdges.id, existing.id));
    return;
  }

  await db.insert(memoryEdges).values({
    id: createEdgeId(userId, fromKey, toKey, relation),
    userId,
    fromKey,
    toKey,
    relation,
    weight: serializeWeight(nextWeight),
    lastSeenAt: journalDate,
    metadata: JSON.stringify({ ...metadata, mentions: 1 }),
  });
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function indexJournalGraph(userId: string, journal: JournalRow) {
  const journalDate = graphTimestamp(journal.createdAt);
  const entities = extractEntities(journal.content);
  const events = extractEventLabels(journal);
  const journalNode = journal.title?.trim() || events[0] || journal.content.slice(0, 80);
  const journalKey = createNodeId(userId, "event", journalNode);

  await upsertNode(userId, "event", journalNode, journalDate, {
    journalId: journal.id,
    journalIds: [journal.id],
    source: "journal",
    title: journal.title || null,
  });

  for (const topic of entities.topics) {
    await upsertNode(userId, "topic", topic, journalDate, {
      journalId: journal.id,
      journalIds: [journal.id],
      source: "journal",
    });
    await upsertEdge(userId, createNodeId(userId, "topic", topic), journalKey, "topic_journal", journalDate, {
      journalId: journal.id,
    });
  }

  for (const person of entities.people) {
    await upsertNode(userId, "person", person, journalDate, {
      journalId: journal.id,
      journalIds: [journal.id],
      source: "journal",
    });
    await upsertEdge(userId, createNodeId(userId, "person", person), journalKey, "person_event", journalDate, {
      journalId: journal.id,
    });
  }

  for (const emotion of entities.emotions) {
    await upsertNode(userId, "emotion", emotion, journalDate, {
      journalId: journal.id,
      journalIds: [journal.id],
      source: "journal",
    });
    await upsertEdge(userId, createNodeId(userId, "emotion", emotion), journalKey, "emotion_event", journalDate, {
      journalId: journal.id,
    });
  }

  for (const event of events) {
    await upsertNode(userId, "event", event, journalDate, {
      journalId: journal.id,
      journalIds: [journal.id],
      source: "journal",
    });
  }
}

export async function refreshMemoryGraph(userId: string) {
  await db.delete(memoryNodes).where(eq(memoryNodes.userId, userId));
  await db.delete(memoryEdges).where(eq(memoryEdges.userId, userId));

  const entries = await db.query.journals.findMany({
    where: eq(journals.userId, userId),
    orderBy: [asc(journals.createdAt)],
  });

  for (const journal of entries) {
    await indexJournalGraph(userId, journal);
  }
}

export async function upsertMemoryGraphForJournal(userId: string, journal: JournalRow) {
  await indexJournalGraph(userId, journal);
}

export async function buildMemoryGraph(userId: string) {
  await refreshMemoryGraph(userId);
  return getMemoryGraphSnapshot(userId);
}

export async function getMemoryGraphSnapshot(userId: string) {
  let nodes: GraphNodeRow[] = [];
  let edges: GraphEdgeRow[] = [];

  try {
    [nodes, edges] = await Promise.all([
      db.query.memoryNodes.findMany({
        where: eq(memoryNodes.userId, userId),
      }),
      db.query.memoryEdges.findMany({
        where: eq(memoryEdges.userId, userId),
      }),
    ]);
  } catch (err: any) {
    // If the memory graph tables don't exist yet (e.g., migrations not applied),
    // avoid crashing the whole application. Return an empty snapshot and log a warning.
    const code = err?.code || (err?.cause && err.cause.code);
    if (code === "42P01" || /relation .* does not exist/i.test(String(err))) {
      console.warn("Memory graph tables missing. Returning empty snapshot. Run DB migrations to enable graph features.", err?.message || err);
      return {
        nodes: [],
        edges: [],
        nodeStats: {},
        edgeStats: {},
      };
    }

    throw err;
  }

  nodes.sort((left, right) => {
    const weightDelta = parseWeight(right.weight) - parseWeight(left.weight);
    if (weightDelta !== 0) {
      return weightDelta;
    }

    return right.lastSeenAt.getTime() - left.lastSeenAt.getTime();
  });

  edges.sort((left, right) => {
    const weightDelta = parseWeight(right.weight) - parseWeight(left.weight);
    if (weightDelta !== 0) {
      return weightDelta;
    }

    return right.lastSeenAt.getTime() - left.lastSeenAt.getTime();
  });

  return {
    nodes: nodes.map(toSimpleNode),
    edges: edges.map(toSimpleEdge),
    nodeStats: summarizeNodes(nodes),
    edgeStats: summarizeEdges(edges),
  };
}

export async function queryGraph(question: string, userId: string) {
  const snapshot = await getMemoryGraphSnapshot(userId);
  const entities = extractEntities(question);
  const normalizedQuestion = question.toLowerCase();

  const scoredNodes = snapshot.nodes
    .map((node) => {
      const matchScore = scoreGraphNode(node, normalizedQuestion, entities);
      return {
        ...node,
        score: matchScore,
      };
    })
    .sort((left, right) => right.score - left.score);

  const topPeople = scoredNodes.filter((node) => node.type === "person").slice(0, 5);
  const topTopics = scoredNodes.filter((node) => node.type === "topic").slice(0, 5);
  const topEmotions = scoredNodes.filter((node) => node.type === "emotion").slice(0, 5);

  const insights: string[] = [];

  if (topPeople[0]) {
    insights.push(`You mention ${topPeople[0].name} most often.`);
  }

  if (topEmotions[0]) {
    insights.push(`The dominant emotional tone is ${topEmotions[0].name}.`);
  }

  if (topTopics[0]) {
    insights.push(`Your strongest topic signal is ${topTopics[0].name}.`);
  }

  if (entities.topics[0]) {
    insights.push(`The question is likely about ${entities.topics[0]}.`);
  }

  return {
    nodes: scoredNodes.slice(0, 12),
    edges: snapshot.edges.slice(0, 20),
    insights,
    topPeople,
    topTopics,
    topEmotions,
  };
}

function scoreGraphNode(
  node: { type: NodeType; name: string; weight: number; lastSeenAt: string },
  question: string,
  entities: ReturnType<typeof extractEntities>
) {
  const lowerName = node.name.toLowerCase();
  const nameMatch = question.includes(lowerName) ? 0.45 : 0;
  const entityMatch =
    entities.people.some((person) => lowerName.includes(person.toLowerCase())) ||
    entities.topics.some((topic) => lowerName.includes(topic.toLowerCase())) ||
    entities.emotions.some((emotion) => lowerName.includes(emotion.toLowerCase()))
      ? 0.35
      : 0;
  const recency = 1 / (Math.max(0, (Date.now() - new Date(node.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const weightScore = Math.min(1, node.weight / 10);

  return Math.min(1, nameMatch + entityMatch + recency * 0.2 + weightScore * 0.3);
}

function toSimpleNode(row: GraphNodeRow): Node & {
  id: string;
  weight: number;
  lastSeenAt: string;
  firstSeenAt: string;
  metadata?: string | null;
} {
  return {
    type: row.type as NodeType,
    name: row.name,
    id: row.id,
    weight: parseWeight(row.weight),
    firstSeenAt: row.firstSeenAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    metadata: row.metadata,
  };
}

function toSimpleEdge(row: GraphEdgeRow): Edge & {
  id: string;
  relation: string;
  lastSeenAt: string;
  metadata?: string | null;
} {
  return {
    from: row.fromKey,
    to: row.toKey,
    weight: parseWeight(row.weight),
    id: row.id,
    relation: row.relation,
    lastSeenAt: row.lastSeenAt.toISOString(),
    metadata: row.metadata,
  };
}

function summarizeNodes(nodes: GraphNodeRow[]) {
  const byType = nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  return byType;
}

function summarizeEdges(edges: GraphEdgeRow[]) {
  return edges.reduce<Record<string, number>>((acc, edge) => {
    acc[edge.relation] = (acc[edge.relation] || 0) + 1;
    return acc;
  }, {});
}
