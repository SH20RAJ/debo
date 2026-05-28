/**
 * Source ingestion: chunk plain text, embed each chunk, upsert into Qdrant,
 * and persist memory_chunks rows so retrieval can resolve back to source titles.
 *
 * Designed to be safe-by-default:
 *   - Returns null if the source has no plainText.
 *   - Skips Qdrant if not configured (still writes memory_chunks rows).
 *   - Best-effort embedding; failures don't break the calling write path.
 */

import { db } from "@debo/db";
import { memoryChunks } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { newId } from "@/lib/api-helpers";
import { embedText } from "@/server/llm/embeddings";
import {
  ensureCollection,
  isQdrantConfigured,
  upsertPoints,
  deletePoints,
} from "@/server/vector/qdrant";

const TARGET_CHUNK_CHARS = 1100; // ~250 tokens, comfortably under model limits
const MIN_CHUNK_CHARS = 200;

/**
 * Naive paragraph-aware chunker. Splits on blank lines, then merges short
 * chunks until each is within [MIN_CHUNK_CHARS, TARGET_CHUNK_CHARS].
 */
export function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if (buf.length === 0) {
      buf = p;
      continue;
    }
    if ((buf.length + p.length + 2) <= TARGET_CHUNK_CHARS) {
      buf = `${buf}\n\n${p}`;
    } else {
      chunks.push(buf);
      buf = p;
    }
  }
  if (buf) chunks.push(buf);

  // Hard-split anything still over target
  const final: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= TARGET_CHUNK_CHARS) {
      final.push(chunk);
      continue;
    }
    for (let i = 0; i < chunk.length; i += TARGET_CHUNK_CHARS) {
      final.push(chunk.slice(i, i + TARGET_CHUNK_CHARS));
    }
  }

  return final.filter((c) => c.length >= MIN_CHUNK_CHARS || final.length === 1);
}

/**
 * Re-index a source: drop existing chunks, chunk the plainText, embed,
 * persist, and upsert vectors to Qdrant when available.
 *
 * Returns the number of chunks indexed, or null when nothing to index.
 */
export async function indexSource(opts: {
  sourceId: string;
  userId: string;
  workspaceId: string;
  plainText: string | null | undefined;
}): Promise<number | null> {
  const { sourceId, userId, workspaceId } = opts;
  const text = (opts.plainText ?? "").trim();
  if (!text) return null;

  // Remove existing chunks for this source so re-indexing is idempotent.
  const existing = await db
    .select({ id: memoryChunks.id, vectorId: memoryChunks.vectorId })
    .from(memoryChunks)
    .where(
      and(
        eq(memoryChunks.userId, userId),
        eq(memoryChunks.sourceId, sourceId),
      ),
    );

  if (existing.length > 0) {
    const vectorIds = existing
      .map((r) => r.vectorId)
      .filter((v): v is string => Boolean(v));
    await db
      .delete(memoryChunks)
      .where(
        and(
          eq(memoryChunks.userId, userId),
          eq(memoryChunks.sourceId, sourceId),
        ),
      );
    if (vectorIds.length > 0 && isQdrantConfigured()) {
      try {
        await deletePoints(vectorIds);
      } catch (err) {
        console.warn("[ingest] failed to delete existing vectors", err);
      }
    }
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  const rows: typeof memoryChunks.$inferInsert[] = [];
  const points: { id: string; vector: number[]; payload: Record<string, unknown> }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkId = newId("chk");
    const chunk = chunks[i]!;
    let vectorId: string | null = null;

    if (isQdrantConfigured()) {
      try {
        const embedding = await embedText(chunk);
        if (embedding) {
          // Use the chunk id directly as the Qdrant point id so we can join.
          await ensureCollection(embedding.dim);
          vectorId = chunkId;
          points.push({
            id: chunkId,
            vector: embedding.vector,
            payload: {
              userId,
              workspaceId,
              sourceId,
              chunkIndex: i,
            },
          });
        }
      } catch (err) {
        console.warn("[ingest] embed failed for chunk", err);
      }
    }

    rows.push({
      id: chunkId,
      userId,
      workspaceId,
      sourceId,
      chunkIndex: i,
      text: chunk,
      tokenCount: Math.ceil(chunk.length / 4),
      vectorId,
    });
  }

  if (rows.length > 0) {
    await db.insert(memoryChunks).values(rows);
  }
  if (points.length > 0) {
    try {
      await upsertPoints(points);
    } catch (err) {
      console.warn("[ingest] qdrant upsert failed", err);
    }
  }

  return rows.length;
}
