import type { FrontendAction } from "@copilotkit/react-core";
import type { Parameter } from "@copilotkit/shared";
import { saveJournal, deleteJournal, getJournals } from "@/actions/journals";
import { addMemory, deleteMemory, getMemory, updateMemory } from "@/actions/memories";
import { searchJournals, getRecentJournalCitations } from "@/lib/vector/search";
import { getRelevantMemories } from "@/lib/memory/query";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph } from "@/lib/life/graph";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { extractMemory } from "@/lib/memory/extract";

type JournalActionArgs = {
  content: string;
  title?: string;
};

type IdActionArgs = {
  id: string;
};

type UpdateJournalArgs = {
  id: string;
  content: string;
  title?: string;
};

type SearchActionArgs = {
  query: string;
};

type SummarizeChatArgs = {
  conversation: string;
  focus?: string;
};

type ExtractInsightsArgs = {
  text: string;
};

type DetectPatternsArgs = {
  question: string;
};

type RecentEntriesArgs = {
  days?: number;
  limit?: number;
};

type RenderJournalCardArgs = {
  id: string;
  title: string;
  content: string;
  date: string;
};

type RenderTimelineItemArgs = {
  date: string;
  summary: string;
  events: string[];
  emotions?: string[];
};

type RenderInsightSummaryArgs = {
  insight: string;
  type?: string;
};

export function getAgentTools(userId: string) {
  return [
    {
      name: "create_journal",
      description: "Create a new journal entry.",
      parameters: [
        { name: "content", type: "string", description: "The content of the journal entry.", required: true },
        { name: "title", type: "string", description: "An optional title for the journal.", required: false }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { content, title } = args as unknown as JournalActionArgs;
        return await saveJournal(content, undefined, title);
      },
    },
    {
      name: "delete_journal",
      description: "Delete a journal entry by ID.",
      parameters: [
        { name: "id", type: "string", description: "The ID of the journal to delete.", required: true }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { id } = args as unknown as IdActionArgs;
        return await deleteJournal(id);
      },
    },
    {
      name: "update_journal",
      description: "Update an existing journal entry.",
      parameters: [
        { name: "id", type: "string", description: "The ID of the journal to update.", required: true },
        { name: "content", type: "string", description: "The new content of the journal entry.", required: true },
        { name: "title", type: "string", description: "Optional updated title.", required: false },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { id, content, title } = args as unknown as UpdateJournalArgs;
        return await saveJournal(content, id, title);
      },
    },
    {
      name: "get_journals",
      description: "List the user's journals.",
      parameters: [
        { name: "limit", type: "number", description: "Maximum number of journals to return.", required: false }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { limit = 10 } = args as { limit?: number };
        return await getJournals("desc", limit, 0);
      },
    },
    {
      name: "search_journals",
      description: "Search user journals for specific events or feelings.",
      parameters: [
        { name: "query", type: "string", description: "The semantic search query.", required: true }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { query } = args as unknown as SearchActionArgs;
        return await searchJournals(query, userId);
      },
    },
    {
      name: "add_memory",
      description: "Add a new memory fact or preference.",
      parameters: [
        { name: "fact", type: "string", description: "The memory content to store.", required: true }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { fact } = args as { fact: string };
        return await addMemory(fact);
      },
    },
    {
      name: "update_memory",
      description: "Update an existing memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true },
        { name: "content", type: "string", description: "The updated memory content.", required: true },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { id, content } = args as { id: string; content: string };
        return await updateMemory(id, content);
      },
    },
    {
      name: "delete_memory",
      description: "Delete a persistent memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { id } = args as unknown as IdActionArgs;
        return await deleteMemory(id);
      },
    },
    {
      name: "get_memory",
      description: "Fetch a persistent memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { id } = args as unknown as IdActionArgs;
        return await getMemory(id);
      },
    },
    {
      name: "get_memories",
      description: "Query persistent memories and facts about the user.",
      parameters: [
        { name: "query", type: "string", description: "Optional memory search query.", required: false },
        { name: "limit", type: "number", description: "Maximum number of memories to return.", required: false },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { query = "", limit = 5 } = args as { query?: string; limit?: number };
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
    },
    {
      name: "get_timeline",
      description: "Fetch a chronological timeline of journal-backed life events.",
      parameters: [
        { name: "grouping", type: "string", description: "Grouping mode: daily, weekly, or monthly.", required: false }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { grouping = "daily" } = args as { grouping?: string };
        const validGrouping = ["daily", "weekly", "monthly"].includes(grouping) ? grouping as "daily" | "weekly" | "monthly" : "daily";
        return await getLifeTimeline(userId, validGrouping);
      },
    },
    {
      name: "get_recent_entries",
      description: "Fetch recent journal entries by date range. Use when the user asks about today, this week, or recent trends.",
      parameters: [
        { name: "days", type: "number", description: "Number of days to look back (1-90).", required: false },
        { name: "limit", type: "number", description: "Maximum number of entries to return (1-10).", required: false },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { days = 7, limit = 5 } = args as RecentEntriesArgs;
        return await getRecentJournalCitations(userId, days, limit);
      },
    },
    {
      name: "summarize_chat",
      description: "Summarize a conversation transcript.",
      parameters: [
        { name: "conversation", type: "string", description: "The conversation transcript.", required: true },
        { name: "focus", type: "string", description: "Optional focus for the summary.", required: false },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { conversation, focus } = args as unknown as SummarizeChatArgs;
        const result = await generateText({
          model: getChatModel(),
          temperature: 0.2,
          system: "Summarize the conversation clearly and briefly. Preserve decisions, requests, and important context.",
          prompt: focus ? `Focus on ${focus}.\n\n${conversation}` : conversation,
        });

        return { summary: result.text };
      },
    },
    {
      name: "extract_insights",
      description: "Extract durable facts, preferences, goals, emotions, and topics from text.",
      parameters: [
        { name: "text", type: "string", description: "The conversation or note text.", required: true },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { text } = args as unknown as ExtractInsightsArgs;
        return await extractMemory(text);
      },
    },
    {
      name: "detect_patterns",
      description: "Analyze journals and memories for recurring patterns.",
      parameters: [
        { name: "question", type: "string", description: "The specific question about patterns.", required: true }
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { question } = args as unknown as DetectPatternsArgs;
        return await queryGraph(question, userId);
      },
    },
    {
      name: "render_journal_card",
      description: "Render a journal entry card in the chat. Use this when the user asks to see a specific journal or when searching for journals.",
      parameters: [
        { name: "id", type: "string", description: "The ID of the journal entry.", required: true },
        { name: "title", type: "string", description: "The title of the journal entry.", required: true },
        { name: "content", type: "string", description: "The content snippet of the journal entry.", required: true },
        { name: "date", type: "string", description: "The date of the journal entry.", required: true },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { id, title, content, date } = args as unknown as RenderJournalCardArgs;
        return { id, title, content, date };
      },
    },
    {
      name: "render_timeline_item",
      description: "Render a specific timeline entry in the chat. Use this when the user asks about what they did on a specific date or period.",
      parameters: [
        { name: "date", type: "string", description: "The date of the timeline entry.", required: true },
        { name: "summary", type: "string", description: "A summary of the day/period.", required: true },
        { name: "events", type: "string", description: "JSON array of key events during this period.", required: true },
        { name: "emotions", type: "string", description: "JSON array of dominant emotions.", required: false },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { date, summary, events, emotions } = args as unknown as RenderTimelineItemArgs;
        const parsedEvents = typeof events === "string" ? JSON.parse(events) : events;
        const parsedEmotions = emotions ? (typeof emotions === "string" ? JSON.parse(emotions) : emotions) : [];
        return { date, summary, events: parsedEvents, emotions: parsedEmotions };
      },
    },
    {
      name: "render_insight_summary",
      description: "Render a deep life insight in the chat. Use this when sharing a discovery or pattern.",
      parameters: [
        { name: "insight", type: "string", description: "The insight text.", required: true },
        { name: "type", type: "string", description: "Type of insight (e.g., emotion, topic, pattern).", required: false },
      ] as Parameter[],
      handler: async (args: Record<string, unknown>) => {
        const { insight, type } = args as unknown as RenderInsightSummaryArgs;
        return { insight, type: type || "general" };
      },
    },
  ] as FrontendAction[];
}
