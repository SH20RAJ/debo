import { defineTool, type ToolDefinition } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { saveJournal, deleteJournal, getJournals } from "@/actions/journals";
import { addMemory, deleteMemory, getMemory, updateMemory } from "@/actions/memories";
import { searchJournals, getRecentJournalCitations } from "@/lib/vector/search";
import { getRelevantMemories } from "@/lib/memory/query";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph } from "@/lib/life/graph";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { extractMemory } from "@/lib/memory/extract";

export function getAgentTools(userId: string): ToolDefinition[] {
  return [
    defineTool({
      name: "create_journal",
      description: "Create a new journal entry.",
      parameters: z.object({
        content: z.string().describe("The content of the journal entry."),
        title: z.string().optional().describe("An optional title for the journal."),
      }),
      execute: async ({ content, title }) => {
        return await saveJournal(content, undefined, title, userId);
      },
    }),
    defineTool({
      name: "delete_journal",
      description: "Delete a journal entry by ID.",
      parameters: z.object({
        id: z.string().describe("The ID of the journal to delete."),
      }),
      execute: async ({ id }) => {
        return await deleteJournal(id, userId);
      },
    }),
    defineTool({
      name: "update_journal",
      description: "Update an existing journal entry.",
      parameters: z.object({
        id: z.string().describe("The ID of the journal to update."),
        content: z.string().describe("The new content of the journal entry."),
        title: z.string().optional().describe("Optional updated title."),
      }),
      execute: async ({ id, content, title }) => {
        return await saveJournal(content, id, title, userId);
      },
    }),
    defineTool({
      name: "get_journals",
      description: "List the user's journals.",
      parameters: z.object({
        limit: z.number().optional().default(10).describe("Maximum number of journals to return."),
      }),
      execute: async ({ limit }) => {
        return await getJournals("desc", limit, 0, userId);
      },
    }),
    defineTool({
      name: "search_journals",
      description: "Search user journals for specific events or feelings.",
      parameters: z.object({
        query: z.string().describe("The semantic search query."),
      }),
      execute: async ({ query }) => {
        try {
          return await searchJournals(query, userId);
        } catch (error) {
          console.error("Agent journal search failed:", error);
          const fallback = await getRecentJournalCitations(userId, 30, 5);

          return {
            error: "Journal vector search is temporarily unavailable.",
            fallback,
          };
        }
      },
    }),
    defineTool({
      name: "add_memory",
      description: "Add a new memory fact or preference.",
      parameters: z.object({
        fact: z.string().describe("The memory content to store."),
      }),
      execute: async ({ fact }) => {
        return await addMemory(fact, userId);
      },
    }),
    defineTool({
      name: "update_memory",
      description: "Update an existing memory by ID.",
      parameters: z.object({
        id: z.string().describe("The memory ID."),
        content: z.string().describe("The updated memory content."),
      }),
      execute: async ({ id, content }) => {
        return await updateMemory(id, content, userId);
      },
    }),
    defineTool({
      name: "delete_memory",
      description: "Delete a persistent memory by ID.",
      parameters: z.object({
        id: z.string().describe("The memory ID."),
      }),
      execute: async ({ id }) => {
        return await deleteMemory(id, userId);
      },
    }),
    defineTool({
      name: "get_memory",
      description: "Fetch a persistent memory by ID.",
      parameters: z.object({
        id: z.string().describe("The memory ID."),
      }),
      execute: async ({ id }) => {
        return await getMemory(id, userId);
      },
    }),
    defineTool({
      name: "get_memories",
      description: "Query persistent memories and facts about the user.",
      parameters: z.object({
        query: z.string().optional().default("").describe("Optional memory search query."),
        limit: z.number().optional().default(5).describe("Maximum number of memories to return."),
      }),
      execute: async ({ query, limit }) => {
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
      },
    }),
    defineTool({
      name: "get_timeline",
      description: "Fetch a chronological timeline of journal-backed life events.",
      parameters: z.object({
        grouping: z.enum(["daily", "weekly", "monthly"]).optional().default("daily").describe("Grouping mode."),
      }),
      execute: async ({ grouping }) => {
        return await getLifeTimeline(userId, grouping);
      },
    }),
    defineTool({
      name: "get_recent_entries",
      description: "Fetch recent journal entries by date range. Use when the user asks about today, this week, or recent trends.",
      parameters: z.object({
        days: z.number().optional().default(7).describe("Number of days to look back (1-90)."),
        limit: z.number().optional().default(5).describe("Maximum number of entries to return (1-10)."),
      }),
      execute: async ({ days, limit }) => {
        return await getRecentJournalCitations(userId, days, limit);
      },
    }),
    defineTool({
      name: "summarize_chat",
      description: "Summarize a conversation transcript.",
      parameters: z.object({
        conversation: z.string().describe("The conversation transcript."),
        focus: z.string().optional().describe("Optional focus for the summary."),
      }),
      execute: async ({ conversation, focus }) => {
        const result = await generateText({
          model: getChatModel(),
          temperature: 0.2,
          system: "Summarize the conversation clearly and briefly. Preserve decisions, requests, and important context.",
          prompt: focus ? `Focus on ${focus}.\n\n${conversation}` : conversation,
        });

        return { summary: result.text };
      },
    }),
    defineTool({
      name: "extract_insights",
      description: "Extract durable facts, preferences, goals, emotions, and topics from text.",
      parameters: z.object({
        text: z.string().describe("The conversation or note text."),
      }),
      execute: async ({ text }) => {
        return await extractMemory(text);
      },
    }),
    defineTool({
      name: "detect_patterns",
      description: "Analyze journals and memories for recurring patterns.",
      parameters: z.object({
        question: z.string().describe("The specific question about patterns."),
      }),
      execute: async ({ question }) => {
        return await queryGraph(question, userId);
      },
    }),
    defineTool({
      name: "render_journal_card",
      description: "Render a journal entry card in the chat. Use this when the user asks to see a specific journal or when searching for journals.",
      parameters: z.object({
        id: z.string().describe("The ID of the journal entry."),
        title: z.string().describe("The title of the journal entry."),
        content: z.string().describe("The content snippet of the journal entry."),
        date: z.string().describe("The date of the journal entry."),
      }),
      execute: async (args) => {
        return args;
      },
    }),
    defineTool({
      name: "render_timeline_item",
      description: "Render a specific timeline entry in the chat. Use this when the user asks about what they did on a specific date or period.",
      parameters: z.object({
        date: z.string().describe("The date of the timeline entry."),
        summary: z.string().describe("A summary of the day/period."),
        events: z.union([z.string(), z.array(z.string())]).describe("Events during this period."),
        emotions: z.union([z.string(), z.array(z.string())]).optional().describe("Dominant emotions."),
      }),
      execute: async ({ date, summary, events, emotions }) => {
        const parsedEvents = typeof events === "string" ? JSON.parse(events) : events;
        const parsedEmotions = emotions ? (typeof emotions === "string" ? JSON.parse(emotions) : emotions) : [];
        return { date, summary, events: parsedEvents, emotions: parsedEmotions };
      },
    }),
    defineTool({
      name: "render_insight_summary",
      description: "Render a deep life insight in the chat. Use this when sharing a discovery or pattern.",
      parameters: z.object({
        insight: z.string().describe("The insight text."),
        type: z.string().optional().default("general").describe("Type of insight."),
      }),
      execute: async (args) => {
        return args;
      },
    }),
    defineTool({
      name: "render_voice_agent",
      description: "Initialize a real-time LiveKit voice conversation in the chat. Use this when the user wants to talk via voice or wants a hands-free interaction.",
      parameters: z.object({}),
      execute: async () => {
        return { success: true };
      },
    }),
  ];
}
