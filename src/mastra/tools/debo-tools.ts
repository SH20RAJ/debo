import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// We use dynamic imports inside the execute functions to break circular dependencies
// between tools -> actions -> mastra -> agents -> tools

type DeboToolContext = {
  requestContext?: {
    all?: {
      userId?: unknown;
    };
    get?: (key: string) => unknown;
  };
  mcp?: {
    extra?: {
      authInfo?: {
        userId?: unknown;
      } & Record<string, unknown>;
    };
  };
};

type MemoryResultItem = {
  id?: unknown;
  content?: unknown;
  date?: unknown;
  label?: unknown;
  sourceType?: unknown;
};

type GraphNodeResult = {
  id?: unknown;
};

function toDeboToolContext(context: unknown): DeboToolContext {
  return (context ?? {}) as DeboToolContext;
}

function readContextValue(context: DeboToolContext, key: string) {
  const requestContext = context.requestContext;
  if (!requestContext) return undefined;

  if (typeof requestContext.get === 'function') {
    return requestContext.get(key);
  }

  return requestContext.all?.[key as keyof typeof requestContext.all];
}

function requireUserId(context: unknown) {
  const toolContext = toDeboToolContext(context);
  const userId =
    readContextValue(toolContext, 'userId') ??
    toolContext.requestContext?.all?.userId ??
    toolContext.mcp?.extra?.authInfo?.userId;

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }

  return userId;
}

export const createJournalTool = createTool({
  id: 'create_journal',
  description: 'Create a new journal entry.',
  inputSchema: z.object({
    content: z.string().describe('The content of the journal entry.'),
    title: z.string().optional().describe('An optional title for the journal.'),
  }),
  execute: async (input, context) => {
    const { saveJournal } = await import('@/actions/journals');
    const userId = requireUserId(context);
    return await saveJournal(input.content, undefined, input.title, userId);
  },
});

export const deleteJournalTool = createTool({
  id: 'delete_journal',
  description: 'Delete a journal entry by ID.',
  inputSchema: z.object({
    id: z.string().describe('The ID of the journal to delete.'),
  }),
  execute: async (input, context) => {
    const { deleteJournal } = await import('@/actions/journals');
    const userId = requireUserId(context);
    return await deleteJournal(input.id, userId);
  },
});

export const getJournalsTool = createTool({
  id: 'get_journals',
  description: "List the user's journals.",
  inputSchema: z.object({
    limit: z.coerce.number().optional().default(10).describe('Maximum number of journals to return.'),
  }),
  execute: async (input, context) => {
    const { getJournals } = await import('@/actions/journals');
    const userId = requireUserId(context);
    const limit = typeof input.limit === 'number' ? input.limit : 10;
    return await getJournals('desc', limit, 0, userId);
  },
});

export const searchJournalsTool = createTool({
  id: 'search_journals',
  description: 'Search user journals for specific events or feelings.',
  inputSchema: z.object({
    query: z.string().describe('The semantic search query.'),
  }),
  execute: async (input, context) => {
    const { searchJournals, getRecentJournalCitations } = await import('@/lib/vector/search');
    const userId = requireUserId(context);
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
  execute: async (input, context) => {
    const { addMemory } = await import('@/actions/memories');
    const userId = requireUserId(context);
    return await addMemory(input.fact, userId);
  },
});

export const getMemoriesTool = createTool({
  id: 'get_memories',
  description: 'Query persistent memories and facts about the user.',
  inputSchema: z.object({
    query: z.string().optional().default('').describe('Optional memory search query.'),
    limit: z.coerce.number().optional().default(5).describe('Maximum number of memories to return.'),
  }),
  execute: async (input, context) => {
    const { getRelevantMemories } = await import('@/lib/memory/query');
    const userId = requireUserId(context);
    const query = typeof input.query === 'string' ? input.query : '';
    const limit = typeof input.limit === 'number' ? input.limit : 5;
    const memories = await getRelevantMemories(userId, query);
    return (memories.items as MemoryResultItem[]).slice(0, limit).map((memory) => ({
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
  execute: async (input, context) => {
    const { getLifeTimeline } = await import('@/lib/life/timeline');
    const userId = requireUserId(context);
    return await getLifeTimeline(userId, input.grouping);
  },
});

export const queryGraphTool = createTool({
  id: 'detect_patterns',
  description: 'Analyze journals and memories for recurring patterns.',
  inputSchema: z.object({
    question: z.string().describe('The specific question about patterns.'),
  }),
  outputSchema: z.object({
    insight: z.string().describe('The primary pattern or insight discovered.'),
    evidence: z.array(z.string()).describe('List of journal IDs or citations supporting this insight.'),
    sentiment: z.enum(['positive', 'negative', 'neutral', 'growth']).describe('The overall sentiment of this pattern.'),
    suggestedAction: z.string().optional().describe('A suggested reflection or action for the user.'),
  }),
  execute: async (input, context) => {
    const { queryGraph } = await import('@/lib/life/graph');
    const userId = requireUserId(context);
    const result = await queryGraph(input.question, userId);
    const sentiment = result.topEmotions?.[0]?.name;
    return {
      insight: result.insights.join(' ') || 'No patterns discovered yet.',
      evidence: (result.nodes as GraphNodeResult[]).slice(0, 5).map((node) => String(node.id ?? '')),
      sentiment:
        sentiment === 'positive' ||
        sentiment === 'negative' ||
        sentiment === 'neutral' ||
        sentiment === 'growth'
          ? sentiment
          : 'neutral',
      suggestedAction: 'Consider reflecting on this recurring pattern in your next journal entry.',
    };
  },
});

export const askDeboTool = createTool({
  id: 'ask_debo',
  description: 'Ask Debo a chat question through the same memory and tool orchestration used by /chat.',
  inputSchema: z.object({
    message: z.string().min(1).describe('The message to send to Debo.'),
    threadId: z.string().optional().describe('Optional Debo chat thread ID to continue.'),
    title: z.string().optional().describe('Optional title for a new MCP-backed thread.'),
    maxSteps: z.coerce.number().min(1).max(8).optional().default(4),
    saveToChat: z.boolean().optional().default(true).describe('Persist the exchange so it appears in Debo chat history.'),
  }),
  outputSchema: z.object({
    threadId: z.string(),
    text: z.string(),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const { mastra } = await import('@/mastra');
    const {
      MASTRA_RESOURCE_ID_KEY,
      MASTRA_THREAD_ID_KEY,
      RequestContext,
    } = await import('@mastra/core/request-context');
    const { ensureChatThread, persistPlainChatExchange } = await import('@/lib/chat/server');

    const thread = await ensureChatThread(userId, input.threadId, input.title || 'MCP chat');
    const requestContext = new RequestContext<Record<string, unknown>>();
    requestContext.set('userId', userId);
    requestContext.set(MASTRA_RESOURCE_ID_KEY, userId);
    requestContext.set(MASTRA_THREAD_ID_KEY, thread.id);
    requestContext.set('mcp.extra', toDeboToolContext(context).mcp?.extra ?? {});

    const agent = mastra.getAgent('debo');
    const maxSteps = typeof input.maxSteps === 'number' ? input.maxSteps : 4;
    const response = await agent.generate(input.message, {
      memory: {
        thread: thread.id,
        resource: userId,
      },
      requestContext,
      maxSteps,
    });
    const text = typeof response.text === 'string' ? response.text : JSON.stringify(response);

    if (input.saveToChat) {
      await persistPlainChatExchange({
        userId,
        threadId: thread.id,
        userText: input.message,
        assistantText: text,
        title: thread.title || input.title || 'MCP chat',
        source: 'mcp',
      });
    }

    return {
      threadId: thread.id,
      text,
    };
  },
});

export const importAiContextTool = createTool({
  id: 'import_ai_context',
  description: 'Import exported context from ChatGPT, Claude, Cursor, Codex, Gemini, or plain text into Debo memory.',
  inputSchema: z.object({
    content: z.string().min(1).max(2_000_000).describe('Exported JSON, Markdown, or plain text context.'),
    source: z.enum(['auto', 'chatgpt', 'claude', 'cursor', 'codex', 'gemini', 'other']).optional().default('auto'),
    title: z.string().optional(),
    threadId: z.string().optional(),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const { importAiContext } = await import('@/lib/chat/context-import');
    return importAiContext({
      userId,
      content: input.content,
      source: input.source,
      title: input.title,
      threadId: input.threadId,
    });
  },
});

export const listChatThreadsTool = createTool({
  id: 'list_chat_threads',
  description: 'List Debo chat threads for the authenticated user.',
  inputSchema: z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(20),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const { listChatThreads } = await import('@/lib/chat/server');
    const limit = typeof input.limit === 'number' ? input.limit : 20;
    const threads = await listChatThreads(userId, limit);
    return threads.map((thread) => ({
      id: thread.id,
      title: thread.title || 'New Chat',
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));
  },
});

export const getChatThreadTool = createTool({
  id: 'get_chat_thread',
  description: 'Read a Debo chat thread and optionally include visible messages.',
  inputSchema: z.object({
    threadId: z.string().describe('Debo chat thread ID.'),
    includeMessages: z.boolean().optional().default(true),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const { extractMessageText, getChatThread, listChatMessages } = await import('@/lib/chat/server');
    const thread = await getChatThread(userId, input.threadId);
    if (!thread) throw new Error('Thread not found');

    const rows = input.includeMessages ? await listChatMessages(userId, thread.id) : [];
    return {
      id: thread.id,
      title: thread.title || 'New Chat',
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      messages: (rows ?? []).map((message) => ({
        id: message.id,
        role: message.role,
        text: extractMessageText(safeParse(message.content) ?? message.content),
        createdAt: message.createdAt,
      })),
    };
  },
});

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const agentDeboTools = {
  createJournalTool,
  deleteJournalTool,
  getJournalsTool,
  searchJournalsTool,
  addMemoryTool,
  getMemoriesTool,
  getTimelineTool,
  queryGraphTool,
};

export const mcpDeboTools = {
  ...agentDeboTools,
  askDeboTool,
  importAiContextTool,
  listChatThreadsTool,
  getChatThreadTool,
};

export const deboTools = agentDeboTools;
