import "server-only";

import { extractEntities } from "@/lib/ai/extract";

export type RankedContextSource = {
  content: string;
  source: "journal" | "memory";
  score: number;
  date?: string;
  journalId?: string;
  title?: string | null;
  snippets?: string[];
  semanticScore?: number;
  recencyScore?: number;
  importanceScore?: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSemanticScore(score?: number) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 0;
  }

  if (score > 1) {
    return clamp(score / 10);
  }

  return clamp(score);
}

export function calculateRecencyScore(date?: string) {
  if (!date) {
    return 0;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  const daysSince = Math.max(0, (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  return clamp(1 / (daysSince + 1));
}

export function calculateImportanceScore(content: string, repeatedMentions = 1) {
  const entities = extractEntities(content);
  const emotionalBoost = Math.min(entities.emotions.length * 0.12, 0.36);
  const peopleBoost = Math.min(entities.people.length * 0.08, 0.24);
  const topicBoost = Math.min(entities.topics.length * 0.05, 0.2);
  const phraseBoost = Math.min(entities.keyPhrases.length * 0.03, 0.12);
  const repetitionBoost = Math.min(Math.max(repeatedMentions - 1, 0) * 0.1, 0.24);

  return clamp(0.18 + emotionalBoost + peopleBoost + topicBoost + phraseBoost + repetitionBoost);
}

export function scoreContextSource(input: {
  content: string;
  semanticScore?: number;
  date?: string;
  repeatedMentions?: number;
  source: "journal" | "memory";
  title?: string | null;
  journalId?: string;
  snippets?: string[];
}) {
  const semanticScore = normalizeSemanticScore(input.semanticScore);
  const recencyScore = calculateRecencyScore(input.date);
  const importanceScore = calculateImportanceScore(input.content, input.repeatedMentions || 1);
  const memoryFloor = input.source === "memory" ? 0.15 : 0;

  const score = clamp(semanticScore * 0.6 + recencyScore * 0.2 + importanceScore * 0.2 + memoryFloor);

  return {
    content: input.content,
    source: input.source,
    score,
    date: input.date,
    journalId: input.journalId,
    title: input.title,
    snippets: input.snippets,
    semanticScore,
    recencyScore,
    importanceScore,
  } satisfies RankedContextSource;
}

export function dedupeRankedSources(sources: RankedContextSource[]) {
  const seen = new Map<string, RankedContextSource>();

  for (const source of sources) {
    const normalized = source.content.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 240);
    const key = `${source.source}:${source.journalId || normalized}`;
    const current = seen.get(key);

    if (!current || current.score < source.score) {
      seen.set(key, source);
    }
  }

  return Array.from(seen.values());
}

export function detectRecurringPatterns(sources: RankedContextSource[]) {
  const counts = new Map<string, number>();

  for (const source of sources) {
    const entities = extractEntities(source.content);
    const allEntities = [...entities.people, ...entities.topics, ...entities.emotions];

    for (const entity of allEntities) {
      const key = entity.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([entity, count]) => ({ entity, count }));
}