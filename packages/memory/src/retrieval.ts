/**
 * Memory retrieval for the memory engine.
 *
 * Searches chunks, memory items, and entities from the Neon DB.
 * Builds context for the Ask Debo feature.
 */

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@debo/db";
import {
  memoryChunks,
  sources,
  memoryItems,
  entities,
} from "@debo/db/schema";

export type MemorySearchResult = {
  chunkId: string;
  sourceId: string;
  content: string;
  heading?: string;
  timestamp?: string;
  pageNumber?: number;
  sourceType: string;
  title?: string;
  relevanceScore: number;
};

export type MemoryItemResult = {
  id: string;
  content: string;
  type: string;
  confidence: number;
  createdAt: string;
};

export type EntityResult = {
  id: string;
  value: string;
  type: string;
  confidence: number;
  createdAt: string;
};

export type ContextResult = {
  chunks: MemorySearchResult[];
  items: MemoryItemResult[];
  entities: EntityResult[];
  contextText: string;
};

/**
 * Search memory chunks by text match.
 */
export async function searchMemoryChunks(
  userId: string,
  query: string,
  limit = 10
): Promise<MemorySearchResult[]> {
  const normalizedQuery = query.replace(/\s+/g, " ").trim();
  if (!normalizedQuery) return [];

  const rows = await db
    .select({
      chunkId: memoryChunks.id,
      sourceId: memoryChunks.sourceId,
      content: memoryChunks.text,
      heading: memoryChunks.metadataJson,
      pageNumber: memoryChunks.pageNumber,
      startTime: memoryChunks.startTime,
      sourceType: sources.type,
      title: sources.title,
      createdAt: memoryChunks.createdAt,
    })
    .from(memoryChunks)
    .innerJoin(sources, eq(memoryChunks.sourceId, sources.id))
    .where(
      and(
        eq(memoryChunks.userId, userId),
        ilike(memoryChunks.text, `%${normalizedQuery}%`)
      )
    )
    .orderBy(desc(memoryChunks.createdAt))
    .limit(Math.min(Math.max(limit, 1), 50));

  return rows.map((row) => ({
    chunkId: row.chunkId,
    sourceId: row.sourceId,
    content: row.content,
    pageNumber: row.pageNumber ?? undefined,
    timestamp: row.startTime ? `${row.startTime}s` : undefined,
    sourceType: row.sourceType,
    title: row.title ?? undefined,
    relevanceScore: calculateTextRelevance(row.content, normalizedQuery),
  }));
}

/**
 * Get all memory chunks for a given source.
 */
export async function getMemoryItemsBySource(sourceId: string) {
  return db
    .select({
      id: memoryChunks.id,
      content: memoryChunks.text,
      chunkIndex: memoryChunks.chunkIndex,
      tokenCount: memoryChunks.tokenCount,
    })
    .from(memoryChunks)
    .where(eq(memoryChunks.sourceId, sourceId))
    .orderBy(memoryChunks.chunkIndex);
}

/**
 * Get entities associated with a source.
 */
export async function getEntitiesBySource(sourceId: string): Promise<{
  items: MemoryItemResult[];
  ents: EntityResult[];
}> {
  const [items, ents] = await Promise.all([
    db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.sourceId, sourceId))
      .limit(20),
    db
      .select()
      .from(entities)
      .where(eq(entities.sourceId, sourceId))
      .limit(20),
  ]);

  return {
    items: items.map((i) => ({
      id: i.id,
      content: i.content,
      type: i.type,
      confidence: Number(i.confidence) || 0.5,
      createdAt: i.createdAt,
    })),
    ents: ents.map((e) => ({
      id: e.id,
      value: e.value,
      type: e.type,
      confidence: Number(e.confidence) || 0.5,
      createdAt: e.createdAt,
    })),
  };
}

/**
 * Build context for Ask Debo.
 */
export async function getRelevantContext(
  userId: string,
  question: string,
  limit = 8
): Promise<ContextResult> {
  const normalizedQuestion = question.replace(/\s+/g, " ").trim();

  const [chunks, recentItems, recentEntities] = await Promise.all([
    searchMemoryChunks(userId, normalizedQuestion, limit),
    db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.userId, userId))
      .orderBy(desc(memoryItems.createdAt))
      .limit(10),
    db
      .select()
      .from(entities)
      .where(eq(entities.userId, userId))
      .orderBy(desc(entities.createdAt))
      .limit(10),
  ]);

  const items: MemoryItemResult[] = recentItems.map((i) => ({
    id: i.id,
    content: i.content,
    type: i.type,
    confidence: Number(i.confidence) || 0.5,
    createdAt: i.createdAt,
  }));

  const ents: EntityResult[] = recentEntities.map((e) => ({
    id: e.id,
    value: e.value,
    type: e.type,
    confidence: Number(e.confidence) || 0.5,
    createdAt: e.createdAt,
  }));

  const contextParts: string[] = [];

  if (chunks.length > 0) {
    contextParts.push("## Relevant Memory Chunks");
    for (const chunk of chunks) {
      contextParts.push(`[${chunk.sourceType} | ${chunk.title}]\n${chunk.content}`);
    }
  }

  if (items.length > 0) {
    contextParts.push("## Known Facts");
    for (const item of items) {
      contextParts.push(`- ${item.content} (${item.type})`);
    }
  }

  if (ents.length > 0) {
    contextParts.push("## Known Entities");
    for (const ent of ents) {
      contextParts.push(`- ${ent.value} (${ent.type})`);
    }
  }

  return { chunks, items, entities: ents, contextText: contextParts.join("\n\n") };
}

function calculateTextRelevance(content: string, query: string): number {
  const lower = content.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0.5;

  let matched = 0;
  for (const word of words) {
    if (lower.includes(word)) matched++;
  }

  const wordScore = matched / words.length;
  const phraseBonus = lower.includes(query.toLowerCase()) ? 0.2 : 0;
  return Math.min(1, wordScore * 0.7 + phraseBonus + 0.1);
}
