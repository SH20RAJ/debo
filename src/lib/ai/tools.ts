import "server-only";

import { generateText, tool } from "ai";
import { z } from "zod";

import { getJournals, saveJournal, deleteJournal } from "@/actions/journals";
import { addMemory, deleteMemory, getMemory, updateMemory } from "@/actions/memories";
import {
  getRecentJournalCitations,
  searchJournals,
} from "@/lib/vector/search";
import { getRelevantMemories } from "@/lib/memory/query";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph } from "@/lib/life/graph";
import { getChatModel } from "@/lib/ai/openai";
import { extractMemory } from "@/lib/memory/extract";

export const createTools = (userId: string) => ({
  create_journal: tool({
    description: "Create a new journal entry and update the user's life graph and memory engine.",
    inputSchema: z.object({
      content: z.string().min(1),
      title: z.string().max(200).optional(),
    }),
    execute: async ({ content, title }) => {
      try {
        return await saveJournal(content, undefined, title);
      } catch (error) {
        console.error("create_journal tool failed:", error);
        return { success: false, error: "Failed to create journal" };
      }
    },
  }),

  update_journal: tool({
    description: "Update an existing journal entry by ID.",
    inputSchema: z.object({
      id: z.string().min(1),
      content: z.string().min(1),
      title: z.string().max(200).optional(),
    }),
    execute: async ({ id, content, title }) => {
      try {
        return await saveJournal(content, id, title);
      } catch (error) {
        console.error("update_journal tool failed:", error);
        return { success: false, error: "Failed to update journal" };
      }
    },
  }),

  delete_journal: tool({
    description: "Delete a journal entry by ID.",
    inputSchema: z.object({
      id: z.string().min(1),
    }),
    execute: async ({ id }) => {
      try {
        return await deleteJournal(id);
      } catch (error) {
        console.error("delete_journal tool failed:", error);
        return { success: false, error: "Failed to delete journal" };
      }
    },
  }),

  get_journals: tool({
    description: "List the user's journals in chronological order.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(50).default(10),
      offset: z.number().int().min(0).default(0),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }),
    execute: async ({ limit, offset, sortOrder }) => {
      try {
        return await getJournals(sortOrder, limit, offset);
      } catch (error) {
        console.error("get_journals tool failed:", error);
        return [];
      }
    },
  }),

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

  add_memory: tool({
    description: "Add a new durable memory or fact to the first-party memory engine.",
    inputSchema: z.object({
      fact: z.string().min(1),
    }),
    execute: async ({ fact }) => {
      try {
        return await addMemory(fact);
      } catch (error) {
        console.error("add_memory tool failed:", error);
        return { success: false, error: "Failed to add memory" };
      }
    },
  }),

  update_memory: tool({
    description: "Update an existing memory or persistent entity by ID.",
    inputSchema: z.object({
      id: z.string().min(1),
      content: z.string().min(1),
    }),
    execute: async ({ id, content }) => {
      try {
        return await updateMemory(id, content);
      } catch (error) {
        console.error("update_memory tool failed:", error);
        return { success: false, error: "Failed to update memory" };
      }
    },
  }),

  delete_memory: tool({
    description: "Delete a memory or persistent entity by ID.",
    inputSchema: z.object({
      id: z.string().min(1),
    }),
    execute: async ({ id }) => {
      try {
        return await deleteMemory(id);
      } catch (error) {
        console.error("delete_memory tool failed:", error);
        return { success: false, error: "Failed to delete memory" };
      }
    },
  }),

  get_memory: tool({
    description: "Fetch a single memory by ID.",
    inputSchema: z.object({
      id: z.string().min(1),
    }),
    execute: async ({ id }) => {
      try {
        return await getMemory(id);
      } catch (error) {
        console.error("get_memory tool failed:", error);
        return { success: false, error: "Failed to load memory" };
      }
    },
  }),

  get_memories: tool({
    description:
      "Retrieve persistent memories and facts about the user from the first-party memory engine. Use this to enrich answers with stable preferences, people, goals, and recurring patterns.",
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
        const memories = await getRelevantMemories(userId, query);
        return memories.items.slice(0, limit).map((memory) => ({
          id: memory.id,
          sourceType: "memory" as const,
          content: memory.content,
          snippet: memory.content,
          date: memory.date,
          score: memory.score,
          source: memory.label || memory.sourceType,
        }));
      } catch (error) {
        console.error("get_memories tool failed:", error);
        return [];
      }
    },
  }),

  get_timeline: tool({
    description: "Fetch a chronological timeline of journal-backed life events.",
    inputSchema: z.object({
      grouping: z.enum(["daily", "weekly", "monthly"]).default("daily"),
    }),
    execute: async ({ grouping }) => {
      try {
        return await getLifeTimeline(userId, grouping);
      } catch (error) {
        console.error("get_timeline tool failed:", error);
        return [];
      }
    },
  }),

  detect_patterns: tool({
    description: "Detect recurring patterns across journals and memories.",
    inputSchema: z.object({
      question: z.string().min(1),
    }),
    execute: async ({ question }) => {
      try {
        return await queryGraph(question, userId);
      } catch (error) {
        console.error("detect_patterns tool failed:", error);
        return { insights: [], patterns: [], topPeople: [], topTopics: [], topEmotions: [] };
      }
    },
  }),

  summarize_chat: tool({
    description: "Summarize a conversation transcript into a concise durable recap.",
    inputSchema: z.object({
      conversation: z.string().min(1),
      focus: z.string().optional(),
    }),
    execute: async ({ conversation, focus }) => {
      try {
        const result = await generateText({
          model: getChatModel(),
          temperature: 0.2,
          system: "Summarize the conversation clearly and briefly. Preserve decisions, requests, and important context.",
          prompt: focus ? `Focus on ${focus}.\n\n${conversation}` : conversation,
        });

        return { summary: result.text };
      } catch (error) {
        console.error("summarize_chat tool failed:", error);
        return { summary: conversation.slice(0, 240) };
      }
    },
  }),

  extract_insights: tool({
    description: "Extract durable facts, preferences, goals, emotions, and topics from conversation text.",
    inputSchema: z.object({
      text: z.string().min(1),
    }),
    execute: async ({ text }) => {
      try {
        return await extractMemory(text);
      } catch (error) {
        console.error("extract_insights tool failed:", error);
        return { facts: [], entities: [], emotions: [], topics: [] };
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
