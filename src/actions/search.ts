"use server";

import { resolveUserId } from "./auth-sync";
import { searchJournals as searchJournalCitations } from "@/lib/vector/search";

export async function searchJournals(query: string = "", limit: number = 5) {
  const userId = await resolveUserId();
  if (!userId) throw new Error("Unauthorized");

  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  try {
    return await searchJournalCitations(query, userId, limit);
  } catch (error) {
    console.error("Search Action Error:", error);
    return [];
  }
}
