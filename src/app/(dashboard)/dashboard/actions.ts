"use server"

import { db } from "@/db";
import { journals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getJournals() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    return await db.query.journals.findMany({
        where: eq(journals.userId, session.user.id),
        orderBy: [desc(journals.createdAt)]
    });
}

export async function getJournal(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    const journal = await db.query.journals.findFirst({
        where: eq(journals.id, id),
    });

    if (journal && journal.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    return journal;
}

export async function saveJournal(content: string, id?: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");

    if (!content.trim()) {
        throw new Error("Content cannot be empty");
    }

    const journalId = id || crypto.randomUUID();
    const userId = session.user.id;

    if (id) {
        // Update existing
        const existing = await getJournal(id);
        if (!existing) throw new Error("Not found");
        
        await db.update(journals).set({
            content,
            updatedAt: new Date()
        }).where(eq(journals.id, id));
    } else {
        // Insert new
        await db.insert(journals).values({
            id: journalId,
            userId,
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

    revalidatePath("/dashboard");
    return journalId;
}
