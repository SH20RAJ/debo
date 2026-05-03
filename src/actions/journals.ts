"use server"

import { db } from "@/db";
import { journals } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, desc, asc, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { removeJournalFromIndex } from "@/lib/vector/search";
import { refreshMemoryGraph } from "@/lib/life/graph";
import { mastra } from "@/mastra";

const journalSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "Content cannot be empty").max(50000, "Entry too long"),
  id: z.string().uuid().optional()
});

// resolveUserId is imported from ./auth-sync

export const getJournals = cache(async (sortOrder: "asc" | "desc" = "desc", limit: number = 10, offset: number = 0, userId?: string) => {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) return [];

    try {
        return await db.query.journals.findMany({
            where: eq(journals.userId, resolvedUserId),
            orderBy: [sortOrder === "desc" ? desc(journals.createdAt) : asc(journals.createdAt)],
            limit,
            offset
        });
    } catch (error) {
        console.error("Failed to fetch journals:", error);
        return [];
    }
});

export const getJournalsCount = cache(async () => {
    const userId = await resolveUserId();
    if (!userId) return 0;

    try {
        const [result] = await db.select({ value: count() })
            .from(journals)
            .where(eq(journals.userId, userId));
        return result.value;
    } catch (error) {
        console.error("Failed to count journals:", error);
        return 0;
    }
});

export const getJournal = cache(async (id: string, userId?: string) => {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) return null;

    try {
        const journal = await db.query.journals.findFirst({
            where: and(eq(journals.id, id), eq(journals.userId, resolvedUserId)),
        });
        return journal || null;
    } catch (error) {
        console.error("Failed to fetch journal:", error);
        return null;
    }
});

export async function saveJournal(rawContent: string, id?: string, title?: string, userId?: string) {
    try {
        const resolvedUserId = await resolveUserId(userId);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        // Validate input
        const result = journalSchema.safeParse({ content: rawContent, id, title });
        if (!result.success) {
            return { success: false, error: result.error.issues[0].message };
        }

        const { content, title: validatedTitle } = result.data;
        const journalId = id || crypto.randomUUID();
        if (id) {
            // Check ownership
            const existing = await getJournal(id, resolvedUserId);
            if (!existing) return { success: false, error: "Entry not found or unauthorized" };
            
            await db.update(journals).set({
                title: validatedTitle || null,
                content,
                updatedAt: new Date()
            }).where(eq(journals.id, id));
        } else {
            // Insert new
            await db.insert(journals).values({
                id: journalId,
                userId: resolvedUserId,
                title: validatedTitle || null,
                content,
            });
        }

        // Use Mastra Workflow for post-processing
        try {
            const savedJournal = await db.query.journals.findFirst({
                where: and(eq(journals.id, journalId), eq(journals.userId, resolvedUserId)),
            });

            if (savedJournal) {
                const workflow = mastra.getWorkflow("journalProcessing");
                if (workflow) {
                    workflow.createRun().then(run => {
                        run.start({
                            inputData: {
                                userId: resolvedUserId,
                                journal: savedJournal,
                            }
                        }).catch((err) => {
                            console.error("Journal processing workflow failed:", err);
                        });
                    });
                }
            }
        } catch (err) {
            console.error("Failed to trigger journal processing workflow:", err);
        }

        revalidatePath("/dashboard/journals");
        revalidatePath(`/dashboard/journal/${journalId}`);
        revalidatePath("/dashboard");
        
        return { success: true, data: journalId };
    } catch (error) {
        console.error("Save journal error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function deleteJournal(id: string, userId?: string) {
    try {
        const resolvedUserId = await resolveUserId(userId);
        if (!resolvedUserId) return { success: false, error: "Unauthorized" };

        const existing = await getJournal(id, resolvedUserId);
        if (!existing) return { success: false, error: "Entry not found or unauthorized" };

        await db.delete(journals).where(eq(journals.id, id));

        try {
            await removeJournalFromIndex(id, resolvedUserId);
        } catch (err) {
            console.error("Failed to delete journal vector from Qdrant:", err);
        }

        try {
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
