/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/db";
import { journals } from "@/db/schema";
import { ilike, eq, and, inArray } from "drizzle-orm";

/**
 * Unified Search Function for Debo
 * Automatically toggles between Vector Search (Prod) and Text Search (Dev)
 */
export async function searchVector(query: string, userId: string, limit: number = 5) {
    const isDev = process.env.NODE_ENV === "development";

    console.log(`[SearchEngine] Mode: ${isDev ? "DEV (Text Search)" : "PROD (Vector Search)"} | Query: "${query}"`);

    if (isDev) {
        return await devSearch(query, userId, limit);
    }

    try {
        return await prodSearch(query, userId, limit);
    } catch (error: any) {
        console.error("[SearchEngine] Production search failed, falling back to text search:", error.message);
        return await devSearch(query, userId, limit);
    }
}

/**
 * Development Search: Basic DB text match
 */
async function devSearch(query: string, userId: string, limit: number) {
    return await db.query.journals.findMany({
        where: and(
            eq(journals.userId, userId),
            ilike(journals.content, `%${query}%`)
        ),
        limit,
        orderBy: (journals, { desc }) => [desc(journals.updatedAt)]
    });
}

/**
 * Production Search: Cloudflare Vectorize + AI Embeddings
 */
async function prodSearch(query: string, userId: string, limit: number) {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as CloudflareEnv;

    if (!env.VECTOR_INDEX || !env.AI) {
        throw new Error("Cloudflare bindings (VECTOR_INDEX or AI) missing");
    }

    // 1. Generate Query Embedding
    const aiResult = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: [query] });
    const vector = (aiResult as any).data[0];

    // 2. Query Vector Index
    const results = await env.VECTOR_INDEX.query(vector, {
        topK: limit,
        returnMetadata: "all",
        // Cloudflare Vectorize doesn't support complex filters in metadata as easily as some other DBs,
        // but we can filter by IDs later or use metadata if configured.
    });

    if (!results.matches || results.matches.length === 0) {
        return [];
    }

    // 3. Extract Journal IDs from metadata
    const journalIds = results.matches
        .map(match => (match.metadata as any)?.journalId)
        .filter(Boolean);

    if (journalIds.length === 0) return [];

    // 4. Fetch full journal objects from NeonDB
    return await db.query.journals.findMany({
        where: and(
            eq(journals.userId, userId),
            inArray(journals.id, journalIds)
        ),
        limit
    });
}
