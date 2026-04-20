"use server"

import { db } from "@/db";
import { journals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

    let journalId = id;

    if (id) {
        // Update
        const existing = await getJournal(id);
        if (!existing) throw new Error("Not found");
        
        await db.update(journals).set({
            content,
            updatedAt: new Date()
        }).where(eq(journals.id, id));
    } else {
        // Insert
        journalId = crypto.randomUUID();
        await db.insert(journals).values({
            id: journalId,
            userId: session.user.id,
            content,
        });
    }

    revalidatePath("/dashboard");
    return journalId;
}
