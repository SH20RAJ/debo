"use server";

import { resolveUserId } from "./auth-sync";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import MemoryClient from "mem0ai";
import { db } from "@debo/db";
import { memoryEntities, memoryFacts } from "@debo/db/schema";
import { extractMemory } from "@debo/memory/extract";
import { getRelevantMemories, type RelevantMemory } from "@debo/memory/query";
import { storeMemory } from "@debo/memory/store";
import { logDatabaseIssue } from "@debo/db/errors";
import { eq } from "drizzle-orm";

const LOCAL_FACT_PREFIX = "local:fact:";
const LOCAL_ENTITY_PREFIX = "local:entity:";

type DashboardMemory = {
  id: string;
  content: string;
  source: string;
  sourceType: string;
  score: number;
  createdAt?: string;
};

function getMem0Client() {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) return null;
  return new MemoryClient({ apiKey });
}

function formatMem0Memory(memory: any): DashboardMemory | null {
  const content = memory.memory || memory.content || memory.text;
  if (typeof content !== "string" || !content.trim()) return null;

  return {
    id: String(memory.id),
    content: content.trim(),
    source: "Mem0",
    sourceType: "fact",
    score: Number(memory.score ?? 1),
    createdAt: memory.created_at || memory.createdAt,
  };
}

function formatLocalMemory(memory: RelevantMemory): DashboardMemory | null {
  if (!memory.content?.trim()) return null;
  const prefix = memory.source === "entity" ? LOCAL_ENTITY_PREFIX : LOCAL_FACT_PREFIX;

  return {
    id: `${prefix}${memory.id}`,
    content: memory.content,
    source: "Debo",
    sourceType: memory.sourceType,
    score: memory.score,
    createdAt: memory.date,
  };
}

function mergeMemories(mem0Items: DashboardMemory[], localItems: DashboardMemory[]) {
  const byContent = new Map<string, DashboardMemory>();

  for (const item of [...mem0Items, ...localItems]) {
    const key = item.content.toLowerCase().replace(/\s+/g, " ").trim();
    const existing = byContent.get(key);
    if (!existing || item.score > existing.score || existing.source !== "Mem0") {
      byContent.set(key, item);
    }
  }

  return Array.from(byContent.values()).sort((left, right) => {
    const scoreDelta = right.score - left.score;
    if (Math.abs(scoreDelta) > 0.01) return scoreDelta;

    const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightDate - leftDate;
  });
}

function parseLocalMemoryId(memoryId: string) {
  if (memoryId.startsWith(LOCAL_FACT_PREFIX)) {
    return { table: "fact" as const, id: memoryId.slice(LOCAL_FACT_PREFIX.length) };
  }

  if (memoryId.startsWith(LOCAL_ENTITY_PREFIX)) {
    return { table: "entity" as const, id: memoryId.slice(LOCAL_ENTITY_PREFIX.length) };
  }

  return null;
}

export const getMemories = cache(async (query: string = "", limit: number = 20, offset: number = 0, userId?: string) => {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const normalizedQuery = query.trim();
    const client = getMem0Client();

    let mem0Items: DashboardMemory[] = [];
    if (client) {
      try {
        let items = [];
        if (normalizedQuery === "") {
          const results = await client.getAll({ filters: { user_id: resolvedUserId } } as any);
          items = Array.isArray(results) ? results : results.results || [];
        } else {
          const results = await client.search(normalizedQuery, {
            filters: { user_id: resolvedUserId },
            limit: Math.max(limit + offset, 20),
          } as any);
          items = Array.isArray(results) ? results : results.results || [];
        }

        mem0Items = items.map(formatMem0Memory).filter(Boolean) as DashboardMemory[];
      } catch {
        console.warn("Mem0 fetch failed, using local memories.");
      }
    }

    const local = await getRelevantMemories(resolvedUserId, normalizedQuery, 100, 0);
    const localItems = local.items.map(formatLocalMemory).filter(Boolean) as DashboardMemory[];
    const combined = mergeMemories(mem0Items, localItems);

    return {
      success: true,
      data: combined.slice(offset, offset + limit),
      totalCount: combined.length,
      insights: local.insights,
    };
  } catch (error) {
    logDatabaseIssue("memories read", error);
    return { success: false, error: "Failed to fetch memories" };
  }
});

export async function deleteMemory(memoryId: string, userId?: string) {
  const resolvedUserId = await resolveUserId(userId, true);
  if (!resolvedUserId) return { success: false, error: "Unauthorized" };

  try {
    const local = parseLocalMemoryId(memoryId);
    if (local?.table === "fact") {
      await db.delete(memoryFacts).where(eq(memoryFacts.id, local.id));
      revalidatePath("/dashboard/memories");
      return { success: true };
    }

    if (local?.table === "entity") {
      await db.delete(memoryEntities).where(eq(memoryEntities.id, local.id));
      revalidatePath("/dashboard/memories");
      return { success: true };
    }

    const client = getMem0Client();
    if (!client) return { success: false, error: "MEM0_API_KEY is not configured" };

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
    const local = parseLocalMemoryId(memoryId);
    if (local) {
      const memory = local.table === "fact"
        ? await db.query.memoryFacts.findFirst({ where: eq(memoryFacts.id, local.id) })
        : await db.query.memoryEntities.findFirst({ where: eq(memoryEntities.id, local.id) });

      if (memory) {
        return {
          success: true,
          data: {
            ...memory,
            content: "content" in memory ? memory.content : memory.name,
            kind: local.table,
          },
        };
      }
    }

    const client = getMem0Client();
    if (!client) return { success: false, error: "MEM0_API_KEY is not configured" };

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
    const local = parseLocalMemoryId(memoryId);
    if (local?.table === "fact") {
      await db.update(memoryFacts).set({ content }).where(eq(memoryFacts.id, local.id));
      revalidatePath("/dashboard/memories");
      return { success: true, data: memoryId };
    }

    if (local?.table === "entity") {
      await db.update(memoryEntities).set({
        name: content,
        normalizedName: content.replace(/\s+/g, " ").trim().toLowerCase(),
        updatedAt: new Date(),
      }).where(eq(memoryEntities.id, local.id));
      revalidatePath("/dashboard/memories");
      return { success: true, data: memoryId };
    }

    const client = getMem0Client();
    if (!client) return { success: false, error: "MEM0_API_KEY is not configured" };

    await client.update(memoryId, { text: content });
    await storeMemory(resolvedUserId, await extractMemory(content));

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
    const cleanFact = fact.replace(/\s+/g, " ").trim();
    if (!cleanFact) return { success: false, error: "Memory cannot be empty" };

    const client = getMem0Client();
    let result: unknown = null;

    if (client) {
      try {
        result = await client.add([{ role: "user" as const, content: cleanFact }], { user_id: resolvedUserId } as any);
      } catch (error) {
        console.warn("Mem0 add failed, storing locally:", error);
      }
    }

    const localResult = await storeMemory(resolvedUserId, await extractMemory(cleanFact));

    revalidatePath("/dashboard/memories");
    return { success: true, data: { mem0: result, local: localResult } };
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

    const messages = data.map(item => ({
        role: "user" as const,
        content: typeof item === "string" ? item : item.content || item.fact || JSON.stringify(item)
    }));

    const client = getMem0Client();
    if (client) {
      try {
        await client.add(messages, { user_id: userId } as any);
      } catch (error) {
        console.warn("Mem0 import failed, storing locally:", error);
      }
    }

    for (const message of messages) {
      await storeMemory(userId, await extractMemory(message.content));
    }

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
