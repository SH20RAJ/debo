"use server"

import { db } from "@/db";
import { journals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { inArray, eq, and } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function searchJournals(query: string = "", limit: number = 5) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    if (!query || typeof query !== "string" || !query.trim()) {
        return [];
    }

    try {
        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as CloudflareEnv;

        if (!env.AI || !env.VECTOR_INDEX) {
            console.warn("Cloudflare bindings not available.");
            return [];
        }

        // Generate embedding for the query
        const result = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: [query] });
        const queryVector = (result as any).data[0];

        if (!queryVector || queryVector.length === 0) {
            return [];
        }

        // Search Vectorize
        const vectorResults = await env.VECTOR_INDEX.query(queryVector, {
            topK: limit,
            returnValues: false,
            returnMetadata: "all"
        });

        if (!vectorResults.matches || vectorResults.matches.length === 0) {
            return [];
        }

        // Filter matches to only include the current user's journals
        const matchedJournalIds = vectorResults.matches
            .filter((match) => match.metadata?.userId === session.user.id)
            .map((match) => match.metadata?.journalId as string)
            .filter(Boolean);

        if (matchedJournalIds.length === 0) {
            return [];
        }

        // Fetch actual journal content from Neon DB
        const matchedJournals = await db.query.journals.findMany({
            where: and(
                eq(journals.userId, session.user.id),
                inArray(journals.id, matchedJournalIds)
            ),
        });

        // Sort by vector similarity score (descending)
        // the db result order isn't guaranteed to match the IN array order
        const sortedJournals = matchedJournals.sort((a, b) => {
            const scoreA = vectorResults.matches.find((m) => m.metadata?.journalId === a.id)?.score || 0;
            const scoreB = vectorResults.matches.find((m) => m.metadata?.journalId === b.id)?.score || 0;
            return scoreB - scoreA;
        });

        return sortedJournals;

    } catch (err) {
        console.error("Failed to semantic search journals:", err);
        return [];
    }
}
