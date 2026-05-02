import { createTool } from '@mastra/core/tool';
import { z } from 'zod';
import { saveJournal, deleteJournal, getJournals } from '@/actions/journals';
import { addMemory, deleteMemory, getMemory, updateMemory } from '@/actions/memories';
import { searchJournals, getRecentJournalCitations } from '@/lib/vector/search';
import { getRelevantMemories } from '@/lib/memory/query';
import { getLifeTimeline } from '@/lib/life/timeline';
import { queryGraph } from '@/lib/life/graph';

const contextSchema = z.object({
  userId: z.string(),
});

export const createJournalTool = createTool({
  id: 'create_journal',
  description: 'Create a new journal entry.',
  inputSchema: z.object({
    content: z.string().describe('The content of the journal entry.'),
    title: z.string().optional().describe('An optional title for the journal.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    return await saveJournal(input.content, undefined, input.title, userId);
  },
});

export const deleteJournalTool = createTool({
  id: 'delete_journal',
  description: 'Delete a journal entry by ID.',
  inputSchema: z.object({
    id: z.string().describe('The ID of the journal to delete.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    return await deleteJournal(input.id, userId);
  },
});

export const getJournalsTool = createTool({
  id: 'get_journals',
  description: "List the user's journals.",
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe('Maximum number of journals to return.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    return await getJournals('desc', input.limit, 0, userId);
  },
});

export const searchJournalsTool = createTool({
  id: 'search_journals',
  description: 'Search user journals for specific events or feelings.',
  inputSchema: z.object({
    query: z.string().describe('The semantic search query.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    try {
      return await searchJournals(input.query, userId);
    } catch (error) {
      const fallback = await getRecentJournalCitations(userId, 30, 5);
      return {
        error: 'Journal vector search is temporarily unavailable.',
        fallback,
      };
    }
  },
});

export const addMemoryTool = createTool({
  id: 'add_memory',
  description: 'Add a new memory fact or preference.',
  inputSchema: z.object({
    fact: z.string().describe('The memory content to store.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    return await addMemory(input.fact, userId);
  },
});

export const getMemoriesTool = createTool({
  id: 'get_memories',
  description: 'Query persistent memories and facts about the user.',
  inputSchema: z.object({
    query: z.string().optional().default('').describe('Optional memory search query.'),
    limit: z.number().optional().default(5).describe('Maximum number of memories to return.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    const memories = await getRelevantMemories(userId, input.query);
    return memories.items.slice(0, input.limit).map((memory) => ({
      id: memory.id,
      content: memory.content,
      date: memory.date,
      source: memory.label || memory.sourceType,
    }));
  },
});

export const getTimelineTool = createTool({
  id: 'get_timeline',
  description: 'Fetch a chronological timeline of journal-backed life events.',
  inputSchema: z.object({
    grouping: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily').describe('Grouping mode.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    return await getLifeTimeline(userId, input.grouping);
  },
});

export const queryGraphTool = createTool({
  id: 'detect_patterns',
  description: 'Analyze journals and memories for recurring patterns.',
  inputSchema: z.object({
    question: z.string().describe('The specific question about patterns.'),
  }),
  execute: async ({ input, context }) => {
    const userId = context?.requestContext?.get('userId') || (context as any).userId;
    if (!userId) throw new Error('Unauthorized');
    return await queryGraph(input.question, userId);
  },
});

export const deboTools = {
  createJournalTool,
  deleteJournalTool,
  getJournalsTool,
  searchJournalsTool,
  addMemoryTool,
  getMemoriesTool,
  getTimelineTool,
  queryGraphTool,
};
