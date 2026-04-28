import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { fetchMemories } from "@/lib/ai/memories";
import {
  getRecentJournalCitations,
  searchJournals,
} from "@/lib/vector/search";

export const createTools = (userId: string) => ({
  search_journals: tool({
    description:
      "Search the user's private journal entries with Qdrant semantic search. Use this for questions about past events, feelings, habits, relationships, and decisions.",
    inputSchema: z.object({
      query: z.string().min(1).describe("Semantic search query"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Maximum number of journal citations to return"),
    }),
    execute: async ({ query, limit }) => {
      try {
        return await searchJournals(query, userId, limit);
      } catch (error) {
        console.error("search_journals tool failed:", error);
        return [];
      }
    },
  }),

  get_memories: tool({
    description:
      "Retrieve persistent Mem0 memories and facts about the user. Use this to enrich answers with stable preferences, people, goals, and recurring patterns.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Optional memory search query"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Maximum number of memory citations to return"),
    }),
    execute: async ({ query = "", limit }) => {
      try {
        return await fetchMemories(userId, query, limit);
      } catch (error) {
        console.error("get_memories tool failed:", error);
        return [];
      }
    },
  }),

  get_recent_entries: tool({
    description:
      "Fetch recent journal entries by date. Use this when the user asks about today, this week, recent trends, or latest entries.",
    inputSchema: z.object({
      days: z
        .number()
        .int()
        .min(1)
        .max(90)
        .default(7)
        .describe("Number of days to look back"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Maximum number of recent entries to return"),
    }),
    execute: async ({ days, limit }) => {
      try {
        return await getRecentJournalCitations(userId, days, limit);
      } catch (error) {
        console.error("get_recent_entries tool failed:", error);
        return [];
      }
    },
  }),
});
