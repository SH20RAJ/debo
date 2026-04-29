import type { FrontendAction } from "@copilotkit/react-core";
import { saveJournal, deleteJournal, getJournals } from "@/actions/journals";
import { addMemory, deleteMemory, getMemory, getMemories, updateMemory } from "@/actions/memories";
import { getChatHistory, getUserChats } from "@/actions/chat";
import { searchJournals } from "@/lib/vector/search";
import { getRelevantMemories } from "@/lib/memory/query";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph } from "@/lib/life/graph";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/openai";
import { extractMemory } from "@/lib/memory/extract";

type CopilotActionContext = {
  actionContext: {
    runAction: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  };
};

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

type TimelineActionArgs = {
  grouping?: string;
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

export function getAgentTools(userId: string): FrontendAction<any>[] {
  return [
    {
      name: "create_journal",
      description: "Create a new journal entry.",
      parameters: [
        { name: "content", type: "string", description: "The content of the journal entry.", required: true },
        { name: "title", type: "string", description: "An optional title for the journal.", required: false }
      ],
      handler: async (args: Record<string, any>) => {
        const { content, title } = args as JournalActionArgs;
        return await saveJournal(content, undefined, title);
      },
    },
    {
      name: "delete_journal",
      description: "Delete a journal entry by ID.",
      parameters: [
        { name: "id", type: "string", description: "The ID of the journal to delete.", required: true }
      ],
      handler: async (args: Record<string, any>) => {
        const { id } = args as IdActionArgs;
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
      ],
      handler: async (args: Record<string, any>) => {
        const { id, content, title } = args as UpdateJournalArgs;
        return await saveJournal(content, id, title);
      },
    },
    {
      name: "get_journals",
      description: "List the user's journals.",
      parameters: [
        { name: "limit", type: "number", description: "Maximum number of journals to return.", required: false },
      ],
      handler: async (args: Record<string, any>) => {
        const { limit = 10 } = args as { limit?: number };
        return await getJournals("desc", limit, 0);
      },
    },
    {
      name: "search_journals",
      description: "Search user journals for specific events or feelings.",
      parameters: [
        { name: "query", type: "string", description: "The semantic search query.", required: true }
      ],
      handler: async (args: Record<string, any>) => {
        const { query } = args as SearchActionArgs;
        const results = await searchJournals(query, userId);
        return results;
      },
    },
    {
      name: "add_memory",
      description: "Add a new memory fact or preference.",
      parameters: [
        { name: "fact", type: "string", description: "The memory content to store.", required: true },
      ],
      handler: async (args: Record<string, any>) => {
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
      ],
      handler: async (args: Record<string, any>) => {
        const { id, content } = args as { id: string; content: string };
        return await updateMemory(id, content);
      },
    },
    {
      name: "delete_memory",
      description: "Delete a persistent memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true },
      ],
      handler: async (args: Record<string, any>) => {
        const { id } = args as IdActionArgs;
        return await deleteMemory(id);
      },
    },
    {
      name: "get_memory",
      description: "Fetch a persistent memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true },
      ],
      handler: async (args: Record<string, any>) => {
        const { id } = args as IdActionArgs;
        return await getMemory(id);
      },
    },
    {
      name: "query_memory",
      description: "Query persistent memories and facts.",
      parameters: [
        { name: "query", type: "string", description: "The memory query.", required: true }
      ],
      handler: async (args: Record<string, any>) => {
        const { query } = args as SearchActionArgs;
        const memories = await getRelevantMemories(userId, query);
        return memories.items;
      },
    },
    {
      name: "summarize_chat",
      description: "Summarize a conversation transcript.",
      parameters: [
        { name: "conversation", type: "string", description: "The conversation transcript.", required: true },
        { name: "focus", type: "string", description: "Optional focus for the summary.", required: false },
      ],
      handler: async (args: Record<string, any>) => {
        const { conversation, focus } = args as SummarizeChatArgs;
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
      ],
      handler: async (args: Record<string, any>) => {
        const { text } = args as ExtractInsightsArgs;
        return await extractMemory(text);
      },
    },
    {
      name: "detect_patterns",
      description: "Analyze journals and memories for recurring patterns.",
      parameters: [
        { name: "question", type: "string", description: "The specific question about patterns.", required: true }
      ],
      handler: async (args: Record<string, any>) => {
        const { question } = args as DetectPatternsArgs;
        const patterns = await queryGraph(question, userId);
        return patterns;
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
      ],
      handler: async () => {
        return "Journal card rendered.";
      },
    },
    {
      name: "render_timeline_item",
      description: "Render a specific timeline entry in the chat. Use this when the user asks about what they did on a specific date or period.",
      parameters: [
        { name: "date", type: "string", description: "The date of the timeline entry.", required: true },
        { name: "summary", type: "string", description: "A summary of the day/period.", required: true },
        { name: "events", type: "string[]", description: "Key events during this period.", required: true },
        { name: "emotions", type: "string[]", description: "Dominant emotions.", required: false },
      ],
      handler: async () => {
        return "Timeline item rendered.";
      },
    },
    {
      name: "render_insight_summary",
      description: "Render a deep life insight in the chat. Use this when sharing a discovery or pattern.",
      parameters: [
        { name: "insight", type: "string", description: "The insight text.", required: true },
        { name: "type", type: "string", description: "Type of insight (e.g., emotion, topic, pattern).", required: false },
      ],
      handler: async () => {
        return "Insight summary rendered.";
      },
    },
  ];
}
