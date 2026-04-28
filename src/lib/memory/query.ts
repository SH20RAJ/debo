import "server-only";

import { cache } from "react";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { memoryEntities, memoryFacts } from "@/db/schema";

export type RelevantMemory = {
  id: string;
  content: string;
  source: "fact" | "entity";
  sourceType: string;
  score: number;
  date?: string;
  label?: string;
};

export const getRelevantMemories = cache(async (userId: string, query: string) => {
  const normalizedQuery = query.replace(/\s+/g, " ").trim();

  const [facts, entities] = await Promise.all([
    db.query.memoryFacts.findMany({
      where: and(
        eq(memoryFacts.userId, userId),
        normalizedQuery
          ? or(
              ilike(memoryFacts.content, `%${normalizedQuery}%`),
              ilike(memoryFacts.type, `%${normalizedQuery}%`)
            )
          : undefined
      ),
      orderBy: [desc(memoryFacts.weight), desc(memoryFacts.createdAt)],
      limit: 20,
    }),
    db.query.memoryEntities.findMany({
      where: and(
        eq(memoryEntities.userId, userId),
        normalizedQuery
          ? or(
              ilike(memoryEntities.name, `%${normalizedQuery}%`),
              ilike(memoryEntities.type, `%${normalizedQuery}%`)
            )
          : undefined
      ),
      orderBy: [desc(memoryEntities.frequency), desc(memoryEntities.updatedAt)],
      limit: 20,
    }),
  ]);

  const factItems = facts.map((fact) => {
    const daysSince = ageInDays(fact.createdAt);
    const recency = 1 / (daysSince + 1);
    const importance = Math.min(1, 0.2 + fact.weight * 0.15);
    const semantic = normalizedQuery && fact.content.toLowerCase().includes(normalizedQuery.toLowerCase()) ? 1 : normalizedQuery ? 0.4 : 0.5;

    return {
      id: fact.id,
      content: fact.content,
      source: "fact" as const,
      sourceType: fact.type,
      score: clamp(semantic * 0.5 + importance * 0.3 + recency * 0.2),
      date: fact.createdAt.toISOString(),
      label: fact.type,
    };
  });

  const entityItems = entities.map((entity) => {
    const daysSince = ageInDays(entity.updatedAt);
    const recency = 1 / (daysSince + 1);
    const importance = Math.min(1, 0.15 + entity.frequency * 0.18);
    const semantic = normalizedQuery && entity.name.toLowerCase().includes(normalizedQuery.toLowerCase()) ? 1 : normalizedQuery ? 0.35 : 0.45;

    return {
      id: entity.id,
      content: entity.name,
      source: "entity" as const,
      sourceType: entity.type,
      score: clamp(semantic * 0.5 + importance * 0.3 + recency * 0.2),
      date: entity.updatedAt.toISOString(),
      label: `${entity.type} (${entity.frequency}x)`,
    };
  });

  const combined = [...factItems, ...entityItems].sort((left, right) => right.score - left.score);

  return {
    items: combined.slice(0, 8),
    insights: buildMemoryInsights(combined),
  };
});

function ageInDays(value: Date) {
  return Math.max(0, (Date.now() - value.getTime()) / (1000 * 60 * 60 * 24));
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function buildMemoryInsights(items: RelevantMemory[]) {
  const topics = items.filter((item) => item.sourceType === "topic");
  const emotions = items.filter((item) => item.sourceType === "emotion");
  const entities = items.filter((item) => item.source === "entity");

  const insights: string[] = [];

  if (entities[0]) {
    insights.push(`You mention ${entities[0].content} often.`);
  }

  if (emotions[0]) {
    insights.push(`You feel ${emotions[0].content} in multiple memories.`);
  }

  if (topics[0]) {
    insights.push(`You spend a lot of memory weight on ${topics[0].content}.`);
  }

  return insights.slice(0, 3);
}
