"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { fetchMemories, getMem0Client } from "@/lib/ai/memories";

export const getMemories = cache(async (query: string = "") => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const memories = await fetchMemories(session.user.id, query, 100);
        return {
            success: true,
            data: memories.map((memory) => ({
                id: memory.id,
                content: memory.content,
            })),
        };
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
        if (!mem0) return { success: false, error: "Mem0 is not configured" };
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
        if (!mem0) return { success: false, error: "Mem0 is not configured" };
        const result = await mem0.add([{ role: "user" as const, content: fact }], { filters: { user_id: session.user.id } });
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
        if (!mem0) return { success: false, error: "Mem0 is not configured" };
        
        // Mem0 batch add
        const messages = data.map(item => ({
            role: "user" as const,
            content: typeof item === 'string' ? item : item.content || item.fact || JSON.stringify(item)
        }));

        await mem0.add(messages, { filters: { user_id: session.user.id } });
        
        revalidatePath("/dashboard/memories");
        return { success: true };
    } catch (error) {
        console.error("Import memories error:", error);
        return { success: false, error: "Import failed. Ensure valid JSON array format." };
    }
}
