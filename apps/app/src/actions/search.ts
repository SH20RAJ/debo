"use server";

import { resolveUserId } from "./auth-sync";
import { db } from "@debo/db";
import { journals } from "@debo/db/schema";
import { createSnippet, searchJournals as searchJournalCitations } from "@debo/memory/vector/search";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export async function searchJournals(query: string = "", limit: number = 5) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) throw new Error("Unauthorized");

  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  try {
    const semanticResults = await searchJournalCitations(query, userId, limit);
    if (semanticResults.length > 0) return semanticResults;

    const lexicalRows = await db.query.journals.findMany({
      where: and(
        eq(journals.userId, userId),
        or(ilike(journals.title, `%${query}%`), ilike(journals.content, `%${query}%`)),
      ),
      orderBy: [desc(journals.updatedAt)],
      limit,
    });

    return lexicalRows.map((journal) => ({
      id: journal.id,
      sourceType: "journal" as const,
      journalId: journal.id,
      title: journal.title,
      content: journal.content,
      snippet: createSnippet(journal.content),
      snippets: [createSnippet(journal.content)],
      date: journal.createdAt.toISOString(),
      score: 0.3,
    }));
  } catch (error) {
    console.error("Search Action Error:", error);
    return [];
  }
}
