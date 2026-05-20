/**
 * retrieve-memory.node.ts — Retrieves relevant sources from the user's DB.
 * Simple recency-based retrieval for now; upgrade to vector search later.
 */

import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import type { SourceFound } from "../schemas/answer.schema";

/**
 * Retrieve the user's most relevant sources as context.
 * Scoped by userId — never returns another user's data.
 */
export async function retrieveMemory(
  userId: string,
  _question: string,
  limit = 10
): Promise<{
  sourcesFound: SourceFound[];
  contextText: string;
}> {
  // Get recent non-deleted sources with content
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

  const sourcesFound: SourceFound[] = rows
    .filter((r) => r.plainText) // only sources with content
    .map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title ?? "Untitled",
      snippet: (r.plainText ?? "").slice(0, 400),
      createdAt: r.createdAt,
    }));

  // Build context text for the LLM prompt
  const contextText = sourcesFound
    .map((s, i) => `[Source ${i + 1}: ${s.type} — "${s.title}"]\n${s.snippet}`)
    .join("\n\n");

  return { sourcesFound, contextText };
}
