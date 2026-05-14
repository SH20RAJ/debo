"use server"

import { db } from "@/db";
import { journals } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, desc, asc, and, count, inArray, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { logDatabaseIssue } from "@/lib/db/errors";

const journalSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "Content cannot be empty").max(50000, "Entry too long"),
  id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional()
});

// resolveUserId is imported from ./auth-sync

export const getJournals = cache(async (sortOrder: "asc" | "desc" = "desc", limit: number = 10, offset: number = 0, userId?: string, query?: string) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return [];

    try {
        if (query && query.trim() !== "") {
            // Use semantic search if query is provided
            const { searchJournals } = await import("@/lib/vector/search");
            const semanticResults = await searchJournals(query, resolvedUserId, limit);
            
            if (semanticResults.length === 0) {
                return await db.query.journals.findMany({
                    where: and(
                        eq(journals.userId, resolvedUserId),
                        or(ilike(journals.title, `%${query}%`), ilike(journals.content, `%${query}%`)),
                    ),
                    orderBy: [sortOrder === "desc" ? desc(journals.createdAt) : asc(journals.createdAt)],
                    limit,
                    offset,
                });
            }
            
            // Fetch full journals for the semantic matches
            const journalIds = semanticResults.map(r => r.journalId).filter(Boolean) as string[];
            const journalsData = await db.query.journals.findMany({
                where: and(eq(journals.userId, resolvedUserId), inArray(journals.id, journalIds)),
            });
            
            // Sort to match semantic score order
            return semanticResults.map(r => journalsData.find(j => j.id === r.journalId)).filter((j): j is typeof journalsData[0] => j !== undefined);
        }

        return await db.query.journals.findMany({
            where: eq(journals.userId, resolvedUserId),
            orderBy: [sortOrder === "desc" ? desc(journals.createdAt) : asc(journals.createdAt)],
            limit,
            offset
        });
    } catch (error) {
        logDatabaseIssue("journals list", error);
        return [];
    }
});

export const getJournalsCount = cache(async (query?: string, providedUserId?: string) => {
    const userId = await resolveUserId(providedUserId, true);
    if (!userId) return 0;

    try {
        if (query && query.trim() !== "") {
             const { searchJournals } = await import("@/lib/vector/search");
             // Semantic search limits are typically around 20, let's estimate
             const semanticResults = await searchJournals(query, userId, 50);
             if (semanticResults.length > 0) return semanticResults.length;

             const [result] = await db.select({ value: count() })
                .from(journals)
                .where(and(
                    eq(journals.userId, userId),
                    or(ilike(journals.title, `%${query}%`), ilike(journals.content, `%${query}%`)),
                ));
             return result.value;
        }

        const [result] = await db.select({ value: count() })
            .from(journals)
            .where(eq(journals.userId, userId));
        return result.value;
    } catch (error) {
        logDatabaseIssue("journals count", error);
        return 0;
    }
});

export const getJournal = cache(async (id: string, userId?: string) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return null;

    try {
        const journal = await db.query.journals.findFirst({
            where: and(eq(journals.id, id), eq(journals.userId, resolvedUserId)),
        });
        return journal || null;
    } catch (error) {
        logDatabaseIssue("journal read", error);
        return null;
    }
});

export async function saveJournal(rawContent: string, id?: string, title?: string, userId?: string, tags: string[] = []) {
    try {
        const resolvedUserId = await resolveUserId(userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        // Validate input
        const result = journalSchema.safeParse({ content: rawContent, id, title, tags });
        if (!result.success) {
            return { success: false, error: result.error.issues[0].message };
        }

        const { content, title: validatedTitle, tags: validatedTags } = result.data;
        const journalId = id || crypto.randomUUID();
        if (id) {
            // Check ownership
            const existing = await getJournal(id, resolvedUserId);
            if (!existing) return { success: false, error: "Entry not found or unauthorized" };
            
            await db.update(journals).set({
                title: validatedTitle || null,
                content,
                tags: validatedTags || [],
                updatedAt: new Date()
            }).where(eq(journals.id, id));
        } else {
            // Insert new
            await db.insert(journals).values({
                id: journalId,
                userId: resolvedUserId,
                title: validatedTitle || null,
                content,
                tags: validatedTags || [],
            });
        }

        void runJournalPostProcessing(resolvedUserId, journalId);

        revalidatePath("/dashboard/journals");
        revalidatePath(`/dashboard/journal/${journalId}`);
        revalidatePath("/dashboard");
        
        return { success: true, data: journalId };
    } catch (error) {
        logDatabaseIssue("journal save", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function deleteJournal(id: string, userId?: string) {
    try {
        const resolvedUserId = await resolveUserId(userId, true);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const existing = await getJournal(id, resolvedUserId);
        if (!existing) return { success: false, error: "Entry not found or unauthorized" };

        await db.delete(journals).where(eq(journals.id, id));

        try {
            const { removeJournalFromIndex } = await import("@/lib/vector/search");
            await removeJournalFromIndex(id, resolvedUserId);
        } catch (err) {
            console.error("Failed to delete journal vector from Qdrant:", err);
        }

        try {
            const { refreshMemoryGraph } = await import("@/lib/life/graph");
            await refreshMemoryGraph(resolvedUserId);
        } catch (err) {
            console.error("Failed to refresh memory graph after deletion:", err);
        }

        revalidatePath("/dashboard/journals");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete journal error:", error);
        return { success: false, error: "Failed to delete entry" };
    }
}

export const getRelatedJournals = cache(async (journalId: string, userId?: string, limit: number = 3) => {
    const resolvedUserId = await resolveUserId(userId, true);
    if (!resolvedUserId) return [];

    try {
        const journal = await db.query.journals.findFirst({
            where: and(eq(journals.id, journalId), eq(journals.userId, resolvedUserId)),
        });
        if (!journal) return [];

        const { searchJournals } = await import("@/lib/vector/search");
        // Use journal content and title to find similar ones
        const query = journal.title ? `${journal.title}\n${journal.content}` : journal.content;
        const semanticResults = await searchJournals(query, resolvedUserId, limit + 1);
        
        const filteredIds = semanticResults
            .map(r => r.journalId)
            .filter((id): id is string => !!id && id !== journalId)
            .slice(0, limit);

        if (filteredIds.length === 0) return [];

        return await db.query.journals.findMany({
            where: and(eq(journals.userId, resolvedUserId), inArray(journals.id, filteredIds)),
        });
    } catch (error) {
        logDatabaseIssue("related journals", error);
        return [];
    }
});

async function runJournalPostProcessing(userId: string, journalId: string) {
    try {
        const savedJournal = await db.query.journals.findFirst({
            where: and(eq(journals.id, journalId), eq(journals.userId, userId)),
        });

        if (!savedJournal) return;

        const [{ indexJournal }, { upsertMemoryGraphForJournal }] = await Promise.all([
            import("@/lib/vector/search"),
            import("@/lib/life/graph"),
        ]);

        const results = await Promise.allSettled([
            indexJournal(savedJournal),
            upsertMemoryGraphForJournal(userId, savedJournal),
        ]);

        for (const result of results) {
            if (result.status === "rejected") {
                console.error("Journal post-processing failed:", result.reason);
            }
        }
    } catch (error) {
        console.error("Failed to run journal post-processing:", error);
    }
}
