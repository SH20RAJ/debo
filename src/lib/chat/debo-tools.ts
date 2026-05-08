import "server-only";

import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  tool,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { getChatModel } from "@/lib/ai/openai";

export const DEBO_SYSTEM_PROMPT = `You are Debo, a calm Jarvis-like personal intelligence assistant for journaling, memory, and reflection.

Operating mode:
- Simple chat is direct. For greetings, thanks, short casual messages, or basic follow-ups, answer naturally in one or two useful sentences.
- Use tools only when needed: save journals, add memories, search journals, retrieve memories, import AI context, or build timelines when the user asks or clearly needs life context.
- Ask before saving unless the user explicitly tells you to save or remember something.
- Retrieve before claiming memory. If the user asks about the past or what you remember, use search or memory tools before answering.
- Analyze from evidence. For pattern questions, use retrieval or graph tools first, then synthesize briefly.
- Imported context counts as user-provided context. Use it when relevant, but do not pretend every imported line is a verified life fact.

Voice:
- Warm, steady, and capable.
- Homie, not hype.
- Never mention internal tool names, schemas, parameters, or implementation details.`;

type RuntimeTool = {
  description: string;
  inputSchema: z.ZodType;
  outputSchema?: z.ZodType;
  execute: (input: never) => Promise<unknown>;
};

type CreateToolOptions = {
  includeMcpTools?: boolean;
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

type GraphSentiment = "positive" | "negative" | "neutral" | "growth";

export function createDeboRuntimeTools(userId: string, options: CreateToolOptions = {}) {
  const baseTools = {
    createJournalTool: {
      description: "Create a new journal entry for the user.",
      inputSchema: z.object({
        content: z.string().min(1).describe("The journal content."),
        title: z.string().optional().describe("An optional journal title."),
      }),
      execute: async (input: { content: string; title?: string }) => {
        const { saveJournal } = await import("@/actions/journals");
        return saveJournal(input.content, undefined, input.title, userId);
      },
    },
    deleteJournalTool: {
      description: "Delete a journal entry by ID.",
      inputSchema: z.object({
        id: z.string().describe("The journal ID to delete."),
      }),
      execute: async (input: { id: string }) => {
        const { deleteJournal } = await import("@/actions/journals");
        return deleteJournal(input.id, userId);
      },
    },
    getJournalsTool: {
      description: "List recent journal entries.",
      inputSchema: z.object({
        limit: z.coerce.number().min(1).max(25).optional().default(10),
      }),
      execute: async (input: { limit?: number }) => {
        const { getJournals } = await import("@/actions/journals");
        return getJournals("desc", input.limit ?? 10, 0, userId);
      },
    },
    searchJournalsTool: {
      description: "Search journal entries for specific events, people, topics, or feelings.",
      inputSchema: z.object({
        query: z.string().min(1).describe("The journal search query."),
      }),
      execute: async (input: { query: string }) => {
        const { getRecentJournalCitations, searchJournals } = await import("@/lib/vector/search");
        try {
          return await searchJournals(input.query, userId);
        } catch {
          const fallback = await getRecentJournalCitations(userId, 30, 5);
          return {
            error: "Journal vector search is temporarily unavailable.",
            fallback,
          };
        }
      },
    },
    addMemoryTool: {
      description: "Add a durable memory fact or preference.",
      inputSchema: z.object({
        fact: z.string().min(1).describe("The memory to store."),
      }),
      execute: async (input: { fact: string }) => {
        const { addMemory } = await import("@/actions/memories");
        return addMemory(input.fact, userId);
      },
    },
    getMemoriesTool: {
      description: "Query persistent memories and facts about the user.",
      inputSchema: z.object({
        query: z.string().optional().default(""),
        limit: z.coerce.number().min(1).max(20).optional().default(5),
      }),
      execute: async (input: { query?: string; limit?: number }) => {
        const { getRelevantMemories } = await import("@/lib/memory/query");
        const memories = await getRelevantMemories(userId, input.query ?? "");
        return (memories.items as MemoryResultItem[]).slice(0, input.limit ?? 5).map((memory) => ({
          id: memory.id,
          content: memory.content,
          date: memory.date,
          source: memory.label || memory.sourceType,
        }));
      },
    },
    getTimelineTool: {
      description: "Fetch a chronological timeline of journal-backed life events.",
      inputSchema: z.object({
        grouping: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
      }),
      execute: async (input: { grouping?: "daily" | "weekly" | "monthly" }) => {
        const { getLifeTimeline } = await import("@/lib/life/timeline");
        return getLifeTimeline(userId, input.grouping ?? "daily");
      },
    },
    queryGraphTool: {
      description: "Analyze journals and memories for recurring patterns.",
      inputSchema: z.object({
        question: z.string().min(1).describe("The pattern question."),
      }),
      outputSchema: z.object({
        insight: z.string(),
        evidence: z.array(z.string()),
        sentiment: z.enum(["positive", "negative", "neutral", "growth"]),
        suggestedAction: z.string().optional(),
      }),
      execute: async (input: { question: string }) => {
        const { queryGraph } = await import("@/lib/life/graph");
        const result = await queryGraph(input.question, userId);
        const sentiment = result.topEmotions?.[0]?.name;
        const normalizedSentiment: GraphSentiment =
          sentiment === "positive" ||
          sentiment === "negative" ||
          sentiment === "neutral" ||
          sentiment === "growth"
            ? sentiment
            : "neutral";

        return {
          insight: result.insights.join(" ") || "No patterns discovered yet.",
          evidence: (result.nodes as GraphNodeResult[]).slice(0, 5).map((node) => String(node.id ?? "")),
          sentiment: normalizedSentiment,
          suggestedAction: "Consider reflecting on this pattern in your next journal entry.",
        };
      },
    },
    importAiContextTool: {
      description: "Import exported context from ChatGPT, Claude, Cursor, Codex, Gemini, or plain text.",
      inputSchema: z.object({
        content: z.string().min(1).max(2_000_000),
        source: z.enum(["auto", "chatgpt", "claude", "cursor", "codex", "gemini", "other"]).optional().default("auto"),
        title: z.string().optional(),
        threadId: z.string().optional(),
      }),
      execute: async (input: {
        content: string;
        source?: "auto" | "chatgpt" | "claude" | "cursor" | "codex" | "gemini" | "other";
        title?: string;
        threadId?: string;
      }) => {
        const { importAiContext } = await import("@/lib/chat/context-import");
        return importAiContext({
          userId,
          content: input.content,
          source: input.source ?? "auto",
          title: input.title,
          threadId: input.threadId,
        });
      },
    },
  } satisfies Record<string, RuntimeTool>;

  if (!options.includeMcpTools) {
    return baseTools;
  }

  const mcpTools = {
    ...baseTools,
    askDeboTool: {
      description: "Ask Debo a chat question through the same memory-aware orchestration used by /chat.",
      inputSchema: z.object({
        message: z.string().min(1),
        threadId: z.string().optional(),
        title: z.string().optional(),
        maxSteps: z.coerce.number().min(1).max(8).optional().default(4),
        saveToChat: z.boolean().optional().default(true),
      }),
      outputSchema: z.object({
        threadId: z.string(),
        text: z.string(),
      }),
      execute: async (input: {
        message: string;
        threadId?: string;
        title?: string;
        maxSteps?: number;
        saveToChat?: boolean;
      }) => {
        const { ensureChatThread, persistPlainChatExchange } = await import("@/lib/chat/server");
        const thread = await ensureChatThread(userId, input.threadId, input.title || "MCP chat");
        const result = await generateText({
          model: getChatModel(),
          system: DEBO_SYSTEM_PROMPT,
          prompt: input.message,
          tools: createDeboAiTools(userId),
          stopWhen: stepCountIs(input.maxSteps ?? 4),
        });

        if (input.saveToChat ?? true) {
          await persistPlainChatExchange({
            userId,
            threadId: thread.id,
            userText: input.message,
            assistantText: result.text,
            title: thread.title || input.title || "MCP chat",
            source: "mcp",
          });
        }

        return {
          threadId: thread.id,
          text: result.text,
        };
      },
    },
    listChatThreadsTool: {
      description: "List Debo chat threads for the authenticated user.",
      inputSchema: z.object({
        limit: z.coerce.number().min(1).max(100).optional().default(20),
      }),
      execute: async (input: { limit?: number }) => {
        const { listChatThreads } = await import("@/lib/chat/server");
        const threads = await listChatThreads(userId, input.limit ?? 20);
        return threads.map((thread) => ({
          id: thread.id,
          title: thread.title || "New Chat",
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
        }));
      },
    },
    getChatThreadTool: {
      description: "Read a Debo chat thread and optionally include visible messages.",
      inputSchema: z.object({
        threadId: z.string(),
        includeMessages: z.boolean().optional().default(true),
      }),
      execute: async (input: { threadId: string; includeMessages?: boolean }) => {
        const { extractMessageText, getChatThread, listChatMessages } = await import("@/lib/chat/server");
        const thread = await getChatThread(userId, input.threadId);
        if (!thread) throw new Error("Thread not found");

        const rows = input.includeMessages === false ? [] : await listChatMessages(userId, thread.id);
        return {
          id: thread.id,
          title: thread.title || "New Chat",
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
    },
  } satisfies Record<string, RuntimeTool>;

  return mcpTools;
}

export function createDeboAiTools(userId: string): ToolSet {
  const runtimeTools = createDeboRuntimeTools(userId);

  return Object.fromEntries(
    Object.entries(runtimeTools).map(([name, runtimeTool]) => [
      name,
      tool({
        description: runtimeTool.description,
        inputSchema: runtimeTool.inputSchema,
        execute: async (input: never) => runtimeTool.execute(input),
      } as never),
    ])
  ) as ToolSet;
}

export async function streamDeboChat(input: {
  userId: string;
  messages: UIMessage[];
  maxSteps?: number;
}) {
  return streamText({
    model: getChatModel(),
    system: DEBO_SYSTEM_PROMPT,
    messages: await convertToModelMessages(input.messages),
    tools: createDeboAiTools(input.userId),
    stopWhen: stepCountIs(input.maxSteps ?? 4),
  });
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
