"use server";

import { resolveUserId } from "./auth-sync";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import MemoryClient from "mem0ai";

function getMem0Client() {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) throw new Error("MEM0_API_KEY is not configured.");
  return new MemoryClient({ apiKey });
}

export const getMemories = cache(async (query: string = "", limit: number = 20, offset: number = 0, userId?: string) => {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const client = getMem0Client();
    
    let items = [];
    if (query.trim() === "") {
        const results = await client.getAll({ filters: { user_id: resolvedUserId } } as any);
        items = results.results || results || [];
        if (Array.isArray(results)) {
            items = results;
        }
    } else {
        const results = await client.search(query, { filters: { user_id: resolvedUserId } } as any);
        items = results.results || results || [];
    }
    
    const formattedData = Array.isArray(items) ? items.slice(offset, offset + limit).map((memory: any) => ({
      id: memory.id,
      content: memory.memory || memory.content || memory.text,
      source: "Mem0",
      sourceType: "user",
      score: memory.score || 1.0,
      createdAt: memory.created_at || memory.createdAt,
    })) : [];

    return {
      success: true,
      data: formattedData,
      totalCount: formattedData.length,
      insights: [],
    };
  } catch (error) {
    console.error("Fetch memories error:", error);
    return { success: false, error: "Failed to fetch memories" };
  }
});

export async function deleteMemory(memoryId: string, userId?: string) {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const client = getMem0Client();
    await client.delete(memoryId);

    revalidatePath("/dashboard/memories");
    return { success: true };
  } catch (error) {
    console.error("Delete memory error:", error);
    return { success: false, error: "Failed to delete memory" };
  }
}

export async function getMemory(memoryId: string, userId?: string) {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const client = getMem0Client();
    const memory = await client.get(memoryId);
    
    if (memory) {
      return { success: true, data: { ...memory, kind: "fact" as const } };
    }

    return { success: false, error: "Memory not found" };
  } catch (error) {
    console.error("Get memory error:", error);
    return { success: false, error: "Failed to fetch memory" };
  }
}

export async function updateMemory(memoryId: string, content: string, userId?: string) {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const client = getMem0Client();
    await client.update(memoryId, { text: content });

    revalidatePath("/dashboard/memories");
    return { success: true, data: memoryId };
  } catch (error) {
    console.error("Update memory error:", error);
    return { success: false, error: "Failed to update memory" };
  }
}

export async function addMemory(fact: string, userId?: string) {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const client = getMem0Client();
    const result = await client.add([{ role: "user" as const, content: fact }], { user_id: resolvedUserId } as any);
    revalidatePath("/dashboard/memories");
    return { success: true, data: result };
  } catch (error) {
    console.error("Add memory error:", error);
    return { success: false, error: "Failed to store memory" };
  }
}

export async function importMemories(jsonContent: string) {
  const userId = await resolveUserId(undefined, true);
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data))
      throw new Error("Invalid format. Expected an array of facts.");

    const client = getMem0Client();
    const messages = data.map(item => ({
        role: "user" as const,
        content: typeof item === "string" ? item : item.content || item.fact || JSON.stringify(item)
    }));

    await client.add(messages, { user_id: userId } as any);

    revalidatePath("/dashboard/memories");
    return { success: true };
  } catch (error) {
    console.error("Import memories error:", error);
    return {
      success: false,
      error: "Import failed. Ensure valid JSON array format.",
    };
  }
}
