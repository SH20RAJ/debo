"use server";

import { stackServerApp } from "@/stack/server";
import { searchJournals as searchJournalCitations } from "@/lib/vector/search";

export async function searchJournals(query: string = "", limit: number = 5) {
  const user = await stackServerApp.getUser();
  if (!user) throw new Error("Unauthorized");

  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  try {
    return await searchJournalCitations(query, user.id, limit);
  } catch (error) {
    console.error("Search Action Error:", error);
    return [];
  }
}
