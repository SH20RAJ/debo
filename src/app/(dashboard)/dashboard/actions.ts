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

    let journalId = id || crypto.randomUUID();
    
    // Generate Embedding via Cloudflare AI
    let vectorizeId: string | null = null;
    let values: number[] = [];
    let env: CloudflareEnv | null = null;
    
    try {
        const ctx = await getCloudflareContext({ async: true });
        env = ctx.env as CloudflareEnv;
        if (env.AI && env.VECTOR_INDEX) {
            const result = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: [content] });
            values = (result as any).data[0];
            vectorizeId = crypto.randomUUID();
        }
    } catch (err) {
        console.warn("Cloudflare AI/Vectorize not available or failed:", err);
    }

    if (id) {
        // Update
        const existing = await getJournal(id);
        if (!existing) throw new Error("Not found");
        
        await db.update(journals).set({
            content,
            vectorizeId: vectorizeId || existing.vectorizeId,
            updatedAt: new Date()
        }).where(eq(journals.id, id));
        
        if (values.length > 0 && vectorizeId && env?.VECTOR_INDEX) {
            try {
                await env.VECTOR_INDEX.insert([
                    {
                        id: vectorizeId,
                        values,
                        metadata: { userId: session.user.id, journalId }
                    }
                ]);
                if (existing.vectorizeId) {
                    await env.VECTOR_INDEX.deleteByIds([existing.vectorizeId]);
                }
            } catch(e) { console.error("Vectorize update error:", e); }
        }
        
    } else {
        // Insert
        await db.insert(journals).values({
            id: journalId,
            userId: session.user.id,
            content,
            vectorizeId
        });
        
        if (values.length > 0 && vectorizeId && env?.VECTOR_INDEX) {
            try {
                await env.VECTOR_INDEX.insert([
                    {
                        id: vectorizeId,
                        values,
                        metadata: { userId: session.user.id, journalId }
                    }
                ]);
            } catch(e) { console.error("Vectorize insert error:", e); }
        }
    }

    revalidatePath("/dashboard");
    return journalId;
}
