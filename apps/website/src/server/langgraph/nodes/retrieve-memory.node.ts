/**
 * Retrieve relevant memory for the user's question.
 *
 * Strategy (in order):
 *   1. If Qdrant + embeddings are configured, embed the question and pull
 *      the top-k chunks; resolve them back to source rows.
 *   2. Otherwise, fall back to recency over `sources` with content. This
 *      keeps Ask working when vector infra isn't deployed yet.
 *
 * Always scoped by `userId` so we never leak across users.
 */

import { db } from "@debo/db";
import { sources, memoryChunks } from "@debo/db/schema";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import type { SourceFound } from "../schemas/answer.schema";
import { isQdrantConfigured, searchSimilar } from "@/server/vector/qdrant";
import { embedQuery } from "@/server/llm/embeddings";

export async function retrieveMemory(
  userId: string,
  question: string,
  limit = 8,
): Promise<{ sourcesFound: SourceFound[]; contextText: string }> {
  let sourcesFound: SourceFound[] = [];

  // Path 1: vector search via Qdrant + embeddings
  if (isQdrantConfigured() && question.trim().length > 0) {
    try {
      const embedding = await embedQuery(question);
      if (embedding) {
        const hits = await searchSimilar(embedding.vector, userId, limit);
        if (hits.length > 0) {
          const chunkIds = hits.map((h) => String(h.id));
          // Re-fetch chunks by id with joined source metadata so we can
          // present a real snippet and source title.
          const rows = await db
            .select({
              chunkId: memoryChunks.id,
              chunkText: memoryChunks.text,
              sourceId: memoryChunks.sourceId,
              sourceType: sources.type,
              sourceTitle: sources.title,
              sourceCreatedAt: sources.createdAt,
            })
            .from(memoryChunks)
            .leftJoin(sources, eq(sources.id, memoryChunks.sourceId))
            .where(
              and(
                eq(memoryChunks.userId, userId),
                inArray(memoryChunks.id, chunkIds),
              ),
            );

          // Preserve Qdrant ranking order
          const byId = new Map(rows.map((r) => [r.chunkId, r] as const));
          sourcesFound = hits
            .map((h) => byId.get(String(h.id)))
            .filter((r): r is NonNullable<typeof r> => Boolean(r))
            .map((r) => ({
              id: r.sourceId,
              type: r.sourceType ?? "manual",
              title: r.sourceTitle ?? "Untitled",
              snippet: (r.chunkText ?? "").slice(0, 400),
              createdAt: r.sourceCreatedAt ?? new Date().toISOString(),
            }));
        }
      }
    } catch (err) {
      console.error("[retrieve-memory] vector search failed, falling back", err);
    }
  }

  // Path 2: recency fallback
  if (sourcesFound.length === 0) {
    const rows = await db
      .select({
        id: sources.id,
        type: sources.type,
        title: sources.title,
        plainText: sources.plainText,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .where(and(eq(sources.userId, userId), ne(sources.status, "deleted")))
      .orderBy(desc(sources.createdAt))
      .limit(limit);

    sourcesFound = rows
      .filter((r) => r.plainText && r.plainText.trim().length > 0)
      .map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title ?? "Untitled",
        snippet: (r.plainText ?? "").slice(0, 400),
        createdAt: r.createdAt,
      }));
  }

  const contextText = sourcesFound
    .map((s, i) => `[Source ${i + 1}: ${s.type} — "${s.title}"]\n${s.snippet}`)
    .join("\n\n");

  return { sourcesFound, contextText };
}
