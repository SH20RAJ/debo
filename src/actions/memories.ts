"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { memoryEntities, memoryFacts } from "@/db/schema";
import { stackServerApp } from "@/stack/server";
import { extractMemory } from "@/lib/memory/extract";
import { getRelevantMemories } from "@/lib/memory/query";
import { storeMemory } from "@/lib/memory/store";
import { cache } from "react";
import { revalidatePath } from "next/cache";

export const getMemories = cache(async (query: string = "") => {
  const user = await stackServerApp.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const memories = await getRelevantMemories(user.id, query);
    return {
      success: true,
      data: memories.items.map((memory) => ({
        id: memory.id,
        content: memory.content,
        source: memory.source,
        sourceType: memory.sourceType,
        score: memory.score,
      })),
      insights: memories.insights,
    };
  } catch (error) {
    console.error("Fetch memories error:", error);
    return { success: false, error: "Failed to fetch memories" };
  }
});

export async function deleteMemory(memoryId: string) {
  const user = await stackServerApp.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const fact = await db.query.memoryFacts.findFirst({
      where: and(eq(memoryFacts.id, memoryId), eq(memoryFacts.userId, user.id)),
    });
    if (fact) {
      await db.delete(memoryFacts).where(and(eq(memoryFacts.id, memoryId), eq(memoryFacts.userId, user.id)));
    } else {
      const entity = await db.query.memoryEntities.findFirst({
        where: and(eq(memoryEntities.id, memoryId), eq(memoryEntities.userId, user.id)),
      });
      if (!entity) return { success: false, error: "Memory not found" };
      await db.delete(memoryEntities).where(and(eq(memoryEntities.id, memoryId), eq(memoryEntities.userId, user.id)));
    }

    revalidatePath("/dashboard/memories");
    revalidatePath("/dashboard/experimental/memories");
    return { success: true };
  } catch (error) {
    console.error("Delete memory error:", error);
    return { success: false, error: "Failed to delete memory" };
  }
}

export async function getMemory(memoryId: string) {
  const user = await stackServerApp.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const fact = await db.query.memoryFacts.findFirst({
      where: and(eq(memoryFacts.id, memoryId), eq(memoryFacts.userId, user.id)),
    });
    if (fact) {
      return { success: true, data: { ...fact, kind: "fact" as const } };
    }

    const entity = await db.query.memoryEntities.findFirst({
      where: and(eq(memoryEntities.id, memoryId), eq(memoryEntities.userId, user.id)),
    });
    if (entity) {
      return { success: true, data: { ...entity, kind: "entity" as const } };
    }

    return { success: false, error: "Memory not found" };
  } catch (error) {
    console.error("Get memory error:", error);
    return { success: false, error: "Failed to fetch memory" };
  }
}

export async function updateMemory(memoryId: string, content: string) {
  const user = await stackServerApp.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const fact = await db.query.memoryFacts.findFirst({
      where: and(eq(memoryFacts.id, memoryId), eq(memoryFacts.userId, user.id)),
    });
    if (fact) {
      await db
        .update(memoryFacts)
        .set({
          content,
          type: fact.type,
          weight: fact.weight + 1,
          createdAt: new Date(),
        })
        .where(and(eq(memoryFacts.id, memoryId), eq(memoryFacts.userId, user.id)));

      revalidatePath("/dashboard/memories");
      revalidatePath("/dashboard/experimental/memories");
      return { success: true, data: memoryId };
    }

    const entity = await db.query.memoryEntities.findFirst({
      where: and(eq(memoryEntities.id, memoryId), eq(memoryEntities.userId, user.id)),
    });
    if (entity) {
      await db
        .update(memoryEntities)
        .set({
          name: content,
          normalizedName: content.toLowerCase().replace(/\s+/g, " ").trim(),
          updatedAt: new Date(),
          frequency: entity.frequency + 1,
        })
        .where(and(eq(memoryEntities.id, memoryId), eq(memoryEntities.userId, user.id)));

      revalidatePath("/dashboard/memories");
      revalidatePath("/dashboard/experimental/memories");
      return { success: true, data: memoryId };
    }

    return { success: false, error: "Memory not found" };
  } catch (error) {
    console.error("Update memory error:", error);
    return { success: false, error: "Failed to update memory" };
  }
}

export async function addMemory(fact: string) {
  const user = await stackServerApp.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const extracted = await extractMemory(fact);
    const result = await storeMemory(user.id, {
      facts: extracted.facts.length > 0 ? extracted.facts : [fact],
      entities: extracted.entities,
      emotions: extracted.emotions,
      topics: extracted.topics,
    });
    revalidatePath("/dashboard/memories");
    revalidatePath("/dashboard/experimental/memories");
    return { success: true, data: result };
  } catch (error) {
    console.error("Add memory error:", error);
    return { success: false, error: "Failed to store memory" };
  }
}

export async function importMemories(jsonContent: string) {
  const user = await stackServerApp.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data))
      throw new Error("Invalid format. Expected an array of facts.");

    for (const item of data) {
      const content =
        typeof item === "string"
          ? item
          : item.content || item.fact || JSON.stringify(item);
      const extracted = await extractMemory(content);
      await storeMemory(user.id, {
        facts: extracted.facts.length > 0 ? extracted.facts : [content],
        entities: extracted.entities,
        emotions: extracted.emotions,
        topics: extracted.topics,
      });
    }

    revalidatePath("/dashboard/memories");
    revalidatePath("/dashboard/experimental/memories");
    return { success: true };
  } catch (error) {
    console.error("Import memories error:", error);
    return {
      success: false,
      error: "Import failed. Ensure valid JSON array format.",
    };
  }
}
