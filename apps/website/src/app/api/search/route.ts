import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { sources, memoryChunks } from "@debo/db/schema";
import { and, desc, eq, ilike, or, inArray, sql } from "drizzle-orm";
import {
  apiError,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import { embedQuery } from "@/server/llm/embeddings";
import { isQdrantConfigured, searchSimilar } from "@/server/vector/qdrant";

const QuerySchema = z.object({
  q: z.string().min(1).max(500),
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

/**
 * GET /api/search?q=hello&type=journal&limit=20
 *
 * Two-stage retrieval:
 *  1. Semantic via Qdrant (when configured) -> resolves point ids back to
 *     memory_chunks, then to sources.
 *  2. Falls back to ILIKE over sources.title/description/plainText.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return apiError("invalid_query", 400);
    const { q, type, limit = 20 } = parsed.data;

    // 1) Semantic — best-effort.
    const semanticIds = new Set<string>();
    if (isQdrantConfigured()) {
      const embedding = await embedQuery(q).catch(() => null);
      if (embedding) {
        const hits = await searchSimilar(embedding.vector, user.id, limit).catch(
          () => [],
        );
        if (hits.length > 0) {
          const chunkIds = hits.map((h) => h.id);
          const chunks = await db
            .select({ sourceId: memoryChunks.sourceId })
            .from(memoryChunks)
            .where(
              and(
                eq(memoryChunks.userId, user.id),
                inArray(memoryChunks.id, chunkIds),
              ),
            );
          for (const c of chunks) semanticIds.add(c.sourceId);
        }
      }
    }

    // 2) Lexical — always run so we degrade gracefully.
    const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const lexicalConditions = [
      eq(sources.userId, user.id),
      eq(sources.workspaceId, workspaceId),
      or(
        ilike(sources.title, pattern),
        ilike(sources.description, pattern),
        ilike(sources.plainText, pattern),
      )!,
    ];
    if (type) lexicalConditions.push(eq(sources.type, type as any));

    const lexical = await db
      .select({
        id: sources.id,
        type: sources.type,
        title: sources.title,
        description: sources.description,
        status: sources.status,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .where(and(...lexicalConditions))
      .orderBy(desc(sources.createdAt))
      .limit(limit);

    // Merge: semantic ids first (rank by vector relevance), then lexical fillers.
    const seen = new Set<string>();
    const ordered: typeof lexical = [];

    if (semanticIds.size > 0) {
      const semantic = await db
        .select({
          id: sources.id,
          type: sources.type,
          title: sources.title,
          description: sources.description,
          status: sources.status,
          createdAt: sources.createdAt,
        })
        .from(sources)
        .where(
          and(
            eq(sources.userId, user.id),
            eq(sources.workspaceId, workspaceId),
            inArray(sources.id, Array.from(semanticIds)),
          ),
        );
      for (const row of semantic) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        ordered.push(row);
      }
    }
    for (const row of lexical) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      ordered.push(row);
    }

    return NextResponse.json({
      query: q,
      results: ordered.slice(0, limit),
      semanticHits: semanticIds.size,
      total: ordered.length,
    });
  });
}
