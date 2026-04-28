"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchJournals as searchJournalCitations } from "@/lib/vector/search";

export async function searchJournals(query: string = "", limit: number = 5) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    if (!query || typeof query !== "string" || !query.trim()) {
        return [];
    }

    try {
        return await searchJournalCitations(query, session.user.id, limit);
    } catch (error) {
        console.error("Search Action Error:", error);
        return [];
    }
}
