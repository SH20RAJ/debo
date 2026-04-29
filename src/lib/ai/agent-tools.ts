import { CopilotAction } from "@copilotkit/shared";
import { saveJournal, deleteJournal, getJournals } from "@/actions/journals";
import { searchJournals } from "@/lib/vector/search";
import { getRelevantMemories } from "@/lib/memory/query";
import { getLifeTimeline } from "@/lib/life/timeline";
import { queryGraph } from "@/lib/life/graph";

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
