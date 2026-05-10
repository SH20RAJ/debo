import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { MemoryClient } from 'mem0ai';

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

// Ensure the API key is read. In production it should be in env.
const getMem0Client = () => {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) {
    throw new Error('MEM0_API_KEY is not set in environment variables.');
  }
  return new MemoryClient({ apiKey });
};

export const addMem0MemoryTool = createTool({
  id: 'add_mem0_memory',
  description: 'Add a new memory fact or preference to Mem0.',
  inputSchema: z.object({
    fact: z.string().describe('The memory content to store.'),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const client = getMem0Client();
    
    const messages: { role: 'user' | 'assistant', content: string }[] = [
      { role: 'user', content: input.fact }
    ];

    await client.add(messages, { user_id: userId } as any);
    return { success: true, message: "Memory added to Mem0 successfully." };
  },
});

export const searchMem0MemoryTool = createTool({
  id: 'search_mem0_memory',
  description: 'Query persistent memories and facts about the user from Mem0.',
  inputSchema: z.object({
    query: z.string().describe('The memory search query.'),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const client = getMem0Client();
    
    const results = await client.search(input.query, { filters: { user_id: userId } } as any);
    return {
      results: results,
    };
  },
});
