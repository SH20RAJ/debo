"use server"

import { db } from "@/db";
import { journals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";
import { z } from "zod";

const journalSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "Content cannot be empty").max(50000, "Entry too long"),
  id: z.string().uuid().optional()
});

export const getJournals = cache(async (sortOrder: "asc" | "desc" = "desc") => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    try {
        return await db.query.journals.findMany({
            where: eq(journals.userId, session.user.id),
            orderBy: [sortOrder === "desc" ? desc(journals.createdAt) : asc(journals.createdAt)]
        });
    } catch (error) {
        console.error("Failed to fetch journals:", error);
        return [];
    }
});

export const getJournal = cache(async (id: string) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return null;

    try {
        const journal = await db.query.journals.findFirst({
            where: and(eq(journals.id, id), eq(journals.userId, session.user.id)),
        });
        return journal || null;
    } catch (error) {
        console.error("Failed to fetch journal:", error);
        return null;
    }
});

export async function saveJournal(rawContent: string, id?: string, title?: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    // Validate input
    const result = journalSchema.safeParse({ content: rawContent, id, title });
    if (!result.success) {
        throw new Error(result.error.errors[0].message);
    }

    const { content, title: validatedTitle } = result.data;
    const journalId = id || crypto.randomUUID();
    const userId = session.user.id;

    if (id) {
        // Check ownership
        const existing = await getJournal(id);
        if (!existing) throw new Error("Entry not found or unauthorized");
        
        await db.update(journals).set({
            title: validatedTitle || null,
            content,
            updatedAt: new Date()
        }).where(eq(journals.id, id));
    } else {
        // Insert new
        await db.insert(journals).values({
            id: journalId,
            userId,
            title: validatedTitle || null,
            content,
        });
    }

    // Offload AI/Vectorize processing to background queue
    try {
        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as any;
        if (env.JOURNAL_QUEUE) {
            await env.JOURNAL_QUEUE.send({
                type: "JOURNAL_UPDATED",
                journalId,
                userId,
                content
            });
        }
    } catch (err) {
        console.warn("Failed to queue journal for background processing:", err);
    }

    revalidatePath("/dashboard/journals");
    revalidatePath(`/dashboard/journal/${journalId}`);
    revalidatePath("/dashboard");
    return journalId;
}

export async function deleteJournal(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const existing = await getJournal(id);
    if (!existing) throw new Error("Entry not found or unauthorized");

    await db.delete(journals).where(eq(journals.id, id));

    revalidatePath("/dashboard/journals");
    revalidatePath("/dashboard");
    return { success: true };
}
