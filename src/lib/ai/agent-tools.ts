import { CopilotAction } from "@copilotkit/shared";
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

export function getAgentTools(userId: string): CopilotAction<any>[] {
  return [
    {
      name: "create_journal",
      description: "Create a new journal entry.",
      parameters: [
        { name: "content", type: "string", description: "The content of the journal entry.", required: true },
        { name: "title", type: "string", description: "An optional title for the journal.", required: false }
      ],
      handler: async ({ content, title }) => {
        return await saveJournal(content, undefined, title);
      },
    },
    {
      name: "delete_journal",
      description: "Delete a journal entry by ID.",
      parameters: [
        { name: "id", type: "string", description: "The ID of the journal to delete.", required: true }
      ],
      handler: async ({ id }) => {
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
      handler: async ({ id, content, title }) => {
        return await saveJournal(content, id, title);
      },
    },
    {
      name: "get_journals",
      description: "List the user's journals.",
      parameters: [
        { name: "limit", type: "number", description: "Maximum number of journals to return.", required: false },
      ],
      handler: async ({ limit = 10 }) => {
        return await getJournals("desc", limit, 0);
      },
    },
    {
      name: "search_journals",
      description: "Search user journals for specific events or feelings.",
      parameters: [
        { name: "query", type: "string", description: "The semantic search query.", required: true }
      ],
      handler: async ({ query }, { actionContext }) => {
        const results = await searchJournals(query, userId);
        
        // Proactively render the most relevant journal card
        if (results[0]) {
          await actionContext.runAction("render_journal_card", {
            id: results[0].id,
            title: results[0].title || "Untitled Entry",
            content: results[0].snippet,
            date: results[0].date
          });
        }
        
        return results;
      },
    },
    {
      name: "add_memory",
      description: "Add a new memory fact or preference.",
      parameters: [
        { name: "fact", type: "string", description: "The memory content to store.", required: true },
      ],
      handler: async ({ fact }) => {
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
      handler: async ({ id, content }) => {
        return await updateMemory(id, content);
      },
    },
    {
      name: "delete_memory",
      description: "Delete a persistent memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true },
      ],
      handler: async ({ id }) => {
        return await deleteMemory(id);
      },
    },
    {
      name: "get_memory",
      description: "Fetch a persistent memory by ID.",
      parameters: [
        { name: "id", type: "string", description: "The memory ID.", required: true },
      ],
      handler: async ({ id }) => {
        return await getMemory(id);
      },
    },
    {
      name: "query_memory",
      description: "Query persistent memories and facts.",
      parameters: [
        { name: "query", type: "string", description: "The memory query.", required: true }
      ],
      handler: async ({ query }) => {
        const memories = await getRelevantMemories(userId, query);
        return memories.items;
      },
    },
    {
      name: "get_timeline",
      description: "Get a chronological timeline of life events.",
      parameters: [
        { name: "grouping", type: "string", description: "Grouping: daily, weekly, or monthly", required: false }
      ],
      handler: async ({ grouping = "daily" }, { actionContext }) => {
        const timeline = await getLifeTimeline(userId, grouping as any);

        if (timeline[0]) {
          await actionContext.runAction("render_timeline_item", {
            date: timeline[0].date,
            summary: timeline[0].summary,
            events: timeline[0].events,
            emotions: timeline[0].emotions
          });
        }

        return timeline;
      },
    },
    {
      name: "get_timeline",
      description: "Get a chronological timeline of life events.",
      parameters: [
        { name: "grouping", type: "string", description: "Grouping: daily, weekly, or monthly", required: false }
      ],
      handler: async ({ grouping = "daily" }, { actionContext }) => {
        const timeline = await getLifeTimeline(userId, grouping as any);
        
        // Proactively render the latest timeline node
        if (timeline[0]) {
          await actionContext.runAction("render_timeline_item", {
            date: timeline[0].date,
            summary: timeline[0].summary,
            events: timeline[0].events,
            emotions: timeline[0].emotions
          });
        }
        
        return timeline;
      },
    },
    {
      name: "summarize_chat",
      description: "Summarize a conversation transcript.",
      parameters: [
        { name: "conversation", type: "string", description: "The conversation transcript.", required: true },
        { name: "focus", type: "string", description: "Optional focus for the summary.", required: false },
      ],
      handler: async ({ conversation, focus }) => {
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
      handler: async ({ text }) => {
        return await extractMemory(text);
      },
    },
    {
      name: "detect_patterns",
      description: "Analyze journals and memories for recurring patterns.",
      parameters: [
        { name: "question", type: "string", description: "The specific question about patterns.", required: true }
      ],
      handler: async ({ question }, { actionContext }) => {
        const patterns = await queryGraph(question, userId);
        
        // Proactively render an insight summary for the most relevant pattern
        if (patterns.insights?.[0]) {
          await actionContext.runAction("render_insight_summary", {
            insight: patterns.insights[0],
            type: "Pattern"
          });
        }
        
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
