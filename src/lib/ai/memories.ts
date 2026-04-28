import "server-only";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import type { CitationSource } from "@/lib/vector/search";
import { createSnippet } from "@/lib/vector/search";
import { eq } from "drizzle-orm";
import Mem0 from "mem0ai";

type MemoryRecord = {
  id?: string;
  content?: string;
  memory?: string;
  text?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  score?: number;
};

export async function getMem0Client(userId: string) {
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  const apiKey = prefs?.mem0Key || process.env.MEM0_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Mem0({
    apiKey,
    host: prefs?.mem0Url || undefined,
  });
}

export function normalizeMemories(response: unknown): MemoryRecord[] {
  if (Array.isArray(response)) {
    return response as MemoryRecord[];
  }

  const value = response as any;
  return value?.results || value?.memories || value?.data || [];
}

export async function fetchMemories(
  userId: string,
  query = "",
  limit = 8
): Promise<CitationSource[]> {
  const mem0 = await getMem0Client(userId);

  if (!mem0) {
    return [];
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  let response: unknown;

  if (query.trim() && typeof (mem0 as any).search === "function") {
    try {
      response = await (mem0 as any).search(query, {
        filters: { user_id: userId },
        limit: safeLimit,
      });
    } catch (error) {
      console.warn("Mem0 search failed, using getAll instead:", error);
    }
  }

  if (!response) {
    response = await mem0.getAll({ filters: { user_id: userId } });
  }

  const normalizedQuery = query.toLowerCase().trim();
  const memories = normalizeMemories(response)
    .map(memoryToCitation)
    .filter(Boolean) as CitationSource[];

  const filtered = normalizedQuery
    ? memories.filter((memory) =>
        memory.content.toLowerCase().includes(normalizedQuery)
      )
    : memories;

  return filtered.slice(0, safeLimit);
}

function memoryToCitation(memory: MemoryRecord): CitationSource | null {
  const content = memory.content || memory.memory || memory.text;

  if (!content) {
    return null;
  }

  return {
    id: memory.id || crypto.randomUUID(),
    sourceType: "memory",
    source: "mem0",
    content,
    snippet: createSnippet(content),
    date: memory.createdAt || memory.created_at || memory.updatedAt || memory.updated_at,
    score: memory.score,
  };
}
