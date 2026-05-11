import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

type NangoToolContext = {
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

function toNangoToolContext(context: unknown): NangoToolContext {
  return (context ?? {}) as NangoToolContext;
}

function readContextValue(context: NangoToolContext, key: string) {
  const requestContext = context.requestContext;
  if (!requestContext) return undefined;

  if (typeof requestContext.get === 'function') {
    return requestContext.get(key);
  }

  return requestContext.all?.[key as keyof typeof requestContext.all];
}

function requireUserId(context: unknown) {
  const toolContext = toNangoToolContext(context);
  const userId =
    readContextValue(toolContext, 'userId') ??
    toolContext.requestContext?.all?.userId ??
    toolContext.mcp?.extra?.authInfo?.userId;

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }

  return userId;
}

/**
 * Tool to trigger a Nango Action Function.
 * This allows the agent to call external APIs (like Google Drive, HubSpot, etc.)
 * through Nango's secure proxy and pre-configured action functions.
 */
export const triggerNangoActionTool = createTool({
  id: 'trigger_nango_action',
  description: 'Execute a pre-configured Nango action function to interact with external APIs.',
  inputSchema: z.object({
    providerConfigKey: z.string().describe('The Nango integration ID (e.g., "google-drive", "hubspot").'),
    actionName: z.string().describe('The name of the Nango action function to trigger.'),
    input: z.record(z.any()).optional().describe('Input parameters for the action function.'),
  }),
  execute: async (input, context) => {
    const userId = requireUserId(context);
    const { nango } = await import('@/lib/nango');

    // In Nango, we use the userId as the connectionId (our standard pattern)
    return await nango.triggerAction(
      input.providerConfigKey,
      userId,
      input.actionName,
      input.input
    );
  },
});

/**
 * Tool to list active Nango connections for the current user.
 */
export const listNangoConnectionsTool = createTool({
  id: 'list_nango_connections',
  description: 'List all active third-party app connections for the current user.',
  inputSchema: z.object({}),
  execute: async (_, context) => {
    const userId = requireUserId(context);
    const { nango } = await import('@/lib/nango');
    
    return await nango.listConnections(userId);
  },
});

export const nangoTools = {
  triggerNangoActionTool,
  listNangoConnectionsTool,
};
