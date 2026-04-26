"use server";

import Mem0 from "mem0ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { revalidatePath } from "next/cache";

async function getMem0Client(userId: string) {
    const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId)
    });

    const apiKey = prefs?.mem0Key || process.env.MEM0_API_KEY || "dummy";
    const host = prefs?.mem0Url || undefined;

    return new Mem0({
        apiKey,
        // @ts-ignore
        host
    });
}

export const getMemories = cache(async (query: string = "") => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const mem0 = await getMem0Client(session.user.id);
        const response = await mem0.getAll({ user_id: session.user.id } as any);
        const memories = Array.isArray(response) ? response : ((response as any).memories || []);
        
        if (query) {
            const filtered = (memories as any[]).filter(m => 
                m.content && m.content.toLowerCase().includes(query.toLowerCase())
            );
            return { success: true, data: filtered };
        }

        return { success: true, data: memories };
    } catch (error) {
        console.error("Fetch memories error:", error);
        return { success: false, error: "Failed to fetch memories from Mem0" };
    }
});

export async function deleteMemory(memoryId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const mem0 = await getMem0Client(session.user.id);
        await mem0.delete(memoryId);
        revalidatePath("/dashboard/memories");
        return { success: true };
    } catch (error) {
        console.error("Delete memory error:", error);
        return { success: false, error: "Failed to delete memory" };
    }
}

export async function addMemory(fact: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const mem0 = await getMem0Client(session.user.id);
        const result = await mem0.add([{ role: "user" as const, content: fact }], { user_id: session.user.id } as any);
        revalidatePath("/dashboard/memories");
        return { success: true, data: result };
    } catch (error) {
        console.error("Add memory error:", error);
        return { success: false, error: "Failed to store memory" };
    }
}

export async function importMemories(jsonContent: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const data = JSON.parse(jsonContent);
        if (!Array.isArray(data)) throw new Error("Invalid format. Expected an array of facts.");
        
        const mem0 = await getMem0Client(session.user.id);
        
        // Mem0 batch add
        const messages = data.map(item => ({
            role: "user" as const,
            content: typeof item === 'string' ? item : item.content || item.fact || JSON.stringify(item)
        }));

        await mem0.add(messages, { user_id: session.user.id } as any);
        
        revalidatePath("/dashboard/memories");
        return { success: true };
    } catch (error) {
        console.error("Import memories error:", error);
        return { success: false, error: "Import failed. Ensure valid JSON array format." };
    }
}
