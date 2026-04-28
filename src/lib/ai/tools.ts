/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from "ai";
import { z } from "zod";
import { searchVector } from "@/lib/vector/search";
import { db } from "@/db";
import { journals, userPreferences } from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import Mem0 from "mem0ai";

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

export const createTools = (userId: string) => ({
  search_journals: (tool as any)({
    description: "Search the user's journal entries for specific information or topics using semantic search.",
    parameters: z.object({
      query: z.string().describe("The search query to find relevant journal entries"),
      limit: z.number().optional().default(5).describe("Maximum number of results to return"),
    }),
    execute: async ({ query, limit }: any) => {
      console.log(`[Tool: search_journals] query: "${query}"`);
      const results = await searchVector(query, userId, limit);
      return results.map((j: any) => ({
        id: j.id,
        content: j.content,
        date: j.createdAt,
        title: j.title
      }));
    },
  }),

  get_memories: (tool as any)({
    description: "Retrieve stored memories and facts about the user.",
    parameters: z.object({
      query: z.string().optional().describe("Optional query to filter memories"),
    }),
    execute: async ({ query }: any) => {
      console.log(`[Tool: get_memories] query: "${query || "all"}"`);
      try {
        const mem0 = await getMem0Client(userId);
        const response = await mem0.getAll({ filters: { user_id: userId } });
        const memories = Array.isArray(response) ? response : ((response as any).memories || []);
        
        if (query) {
            const filtered = (memories as any[]).filter(m => 
                m.content && m.content.toLowerCase().includes(query.toLowerCase())
            );
            return filtered.map(m => ({ id: m.id, content: m.content }));
        }

        return (memories as any[]).map(m => ({ id: m.id, content: m.content }));
      } catch (error) {
        console.error("Tool get_memories error:", error);
        return [];
      }
    },
  }),

  get_recent_entries: (tool as any)({
    description: "Get the user's most recent journal entries from the last 7 days.",
    parameters: z.object({
      days: z.number().optional().default(7).describe("Number of days to look back"),
    }),
    execute: async ({ days }: any) => {
      console.log(`[Tool: get_recent_entries] days: ${days}`);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const results = await db.query.journals.findMany({
        where: and(
          eq(journals.userId, userId),
          gte(journals.createdAt, cutoff)
        ),
        orderBy: [desc(journals.createdAt)],
      });

      return results.map((j: any) => ({
        id: j.id,
        content: j.content,
        date: j.createdAt,
        title: j.title
      }));
    },
  }),
});
