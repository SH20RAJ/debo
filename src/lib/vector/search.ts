import "server-only";

import { db } from "@/db";
import { journals } from "@/db/schema";
import { extractEntities } from "@/lib/ai/extract";
import { embed } from "@/lib/ai/embeddings";
import {
  deleteVectorsByFilter,
  searchVector as searchQdrantVector,
  upsertVector,
  type QdrantMatch,
} from "@/lib/vector/qdrant";
import { and, desc, eq, gte, inArray } from "drizzle-orm";

export type CitationSource = {
  id: string;
  sourceType: "journal" | "memory";
  content: string;
  snippet: string;
  snippets?: string[];
  date?: string;
  title?: string | null;
  journalId?: string;
  score?: number;
  source?: string;
  chunkIndex?: number;
  chunkCount?: number;
  semanticScore?: number;
  recencyScore?: number;
  importanceScore?: number;
};

type JournalForIndex = {
  id: string;
  userId: string;
  title?: string | null;
  content: string;
  createdAt: Date | string;
};

type JournalChunkPayload = {
  userId: string;
  journalId: string;
  content: string;
  createdAt: string;
  title?: string | null;
  chunkIndex?: number;
  chunkCount?: number;
};

type JournalChunkMatch = QdrantMatch & {
  payload?: JournalChunkPayload;
};

export function createSnippet(content: string, maxLength = 320) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function toDateString(value: Date | string | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function citationFromJournal(
  journal: JournalForIndex,
  match?: QdrantMatch
): CitationSource {
  const content = match?.payload?.content || journal.content;
  const entities = extractEntities(content);

  return {
    id: journal.id,
    sourceType: "journal",
    journalId: journal.id,
    title: journal.title,
    content,
    snippet: createSnippet(content),
    snippets: [createSnippet(content)],
    date: toDateString(journal.createdAt),
    score: match?.score,
    chunkIndex: match?.payload?.chunkIndex,
    chunkCount: match?.payload?.chunkCount,
    semanticScore: match?.score,
    importanceScore: Math.min(
      1,
      0.18 +
        Math.min(entities.people.length * 0.08, 0.24) +
        Math.min(entities.topics.length * 0.06, 0.24) +
        Math.min(entities.emotions.length * 0.1, 0.3)
    ),
  };
}

export async function indexJournal(journal: JournalForIndex) {
  const { splitIntoChunks } = await import("@/lib/ai/chunking");
  const chunks = splitIntoChunks(journal.content);

  if (chunks.length === 0) {
    return;
  }

  await deleteVectorsByFilter({
    must: [
      {
        key: "journalId",
        match: {
          value: journal.id,
        },
      },
    ],
  });

  const createdAt = toDateString(journal.createdAt) || new Date().toISOString();

  await Promise.all(
    chunks.map(async (chunk, chunkIndex) => {
      const vector = await embed(chunk);

      await upsertVector({
        id: `${journal.id}_${chunkIndex}`,
        vector,
        payload: {
          userId: journal.userId,
          journalId: journal.id,
          title: journal.title,
          content: chunk,
          createdAt,
          chunkIndex,
          chunkCount: chunks.length,
        },
      });
    })
  );
}

export async function removeJournalFromIndex(journalId: string) {
  await deleteVectorsByFilter({
    must: [
      {
        key: "journalId",
        match: {
          value: journalId,
        },
      },
    ],
  });
}

export async function searchJournals(
  query: string,
  userId: string,
  limit = 5
): Promise<CitationSource[]> {
  const vector = await embed(query);
  const matches = (await searchQdrantVector(vector, userId, Math.max(limit * 2, 10))) as JournalChunkMatch[];

  if (matches.length === 0) {
    return [];
  }

  const journalIds = Array.from(new Set(matches.map((match) => match.payload?.journalId).filter(Boolean))) as string[];

  const rows = await db.query.journals.findMany({
    where: and(eq(journals.userId, userId), inArray(journals.id, journalIds)),
  });

  const journalById = new Map(rows.map((journal) => [journal.id, journal]));
  const groupedMatches = groupChunkMatches(matches);

  return groupedMatches
    .map((group) => {
      const journal = journalById.get(group.journalId);
      const content = group.snippets.join("\n\n");

      if (journal) {
        return {
          ...citationFromJournal(journal, group.bestMatch),
          content,
          snippet: createSnippet(content),
          snippets: group.snippets.map((snippet) => createSnippet(snippet)),
          score: group.score,
          semanticScore: group.semanticScore,
          recencyScore: group.recencyScore,
          importanceScore: group.importanceScore,
        };
      }

      return citationFromMatchPayload(group.bestMatch, group.snippets);
    })
    .filter((item): item is CitationSource => Boolean(item))
    .sort((left, right) => (right.score || 0) - (left.score || 0))
    .slice(0, limit) as CitationSource[];
}

export async function getRecentJournalCitations(
  userId: string,
  days = 7,
  limit = 5
): Promise<CitationSource[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rows = await db.query.journals.findMany({
    where: and(eq(journals.userId, userId), gte(journals.createdAt, cutoff)),
    orderBy: [desc(journals.createdAt)],
    limit: Math.min(Math.max(limit, 1), 20),
  });

  return rows.map((journal) => citationFromJournal(journal));
}

function citationFromMatchPayload(match: QdrantMatch, snippets: string[] = []): CitationSource | null {
  const payload = match.payload;

  if (!payload?.journalId || !payload.content) {
    return null;
  }

  return {
    id: payload.journalId,
    sourceType: "journal",
    journalId: payload.journalId,
    title: payload.title,
    content: payload.content,
    snippet: createSnippet(payload.content),
    snippets: snippets.length > 0 ? snippets.map((snippet) => createSnippet(snippet)) : [createSnippet(payload.content)],
    date: payload.createdAt,
    score: match.score,
    chunkIndex: payload.chunkIndex,
    chunkCount: payload.chunkCount,
    semanticScore: match.score,
  };
}

type GroupedChunkMatch = {
  journalId: string;
  bestMatch: QdrantMatch;
  snippets: string[];
  score: number;
  semanticScore: number;
  recencyScore: number;
  importanceScore: number;
};

function groupChunkMatches(matches: JournalChunkMatch[]) {
  const grouped = new Map<string, GroupedChunkMatch>();

  for (const match of matches) {
    const payload = match.payload;

    if (!payload?.journalId || !payload.content) {
      continue;
    }

    const existing = grouped.get(payload.journalId);
    const snippets = existing ? [...existing.snippets, payload.content] : [payload.content];
    const dedupedSnippets = dedupeSnippets(snippets);
    const bestMatch = !existing || (match.score || 0) > (existing.bestMatch.score || 0) ? match : existing.bestMatch;
    const semanticScore = Math.max(existing?.semanticScore || 0, match.score || 0);
    const recencyScore = calculateRecencyScore(payload.createdAt);
    const importanceScore = calculateImportanceScore(dedupedSnippets.join("\n\n"), dedupedSnippets.length);
    const score = semanticScore * 0.6 + recencyScore * 0.2 + importanceScore * 0.2;

    grouped.set(payload.journalId, {
      journalId: payload.journalId,
      bestMatch,
      snippets: dedupedSnippets,
      score,
      semanticScore,
      recencyScore,
      importanceScore,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => right.score - left.score);
}

function dedupeSnippets(snippets: string[]) {
  const uniqueSnippets: string[] = [];

  for (const snippet of snippets) {
    const cleaned = snippet.replace(/\s+/g, " ").trim();

    if (!cleaned) {
      continue;
    }

    const normalized = cleaned.toLowerCase().slice(0, 240);

    if (uniqueSnippets.some((existing) => existing.toLowerCase().slice(0, 240) === normalized)) {
      continue;
    }

    uniqueSnippets.push(cleaned);
  }

  return uniqueSnippets.slice(0, 3);
}

function calculateRecencyScore(date?: string) {
  if (!date) {
    return 0;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  const daysSince = Math.max(0, (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));

  return 1 / (daysSince + 1);
}

function calculateImportanceScore(content: string, repeatedMentions = 1) {
  const entities = extractEntities(content);

  return Math.min(
    1,
    0.18 +
      Math.min(entities.emotions.length * 0.1, 0.3) +
      Math.min(entities.people.length * 0.08, 0.24) +
      Math.min(entities.topics.length * 0.05, 0.2) +
      Math.min(Math.max(repeatedMentions - 1, 0) * 0.08, 0.24)
  );
}
