// Removed server-only for worker compatibility

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

export const DEBO_SYSTEM_PROMPT = `You are Debo, a calm Jarvis-like personal intelligence assistant for journaling, memory, and reflection. You are the user's trusted cognitive layer - their second brain, their memory palace, their reflective companion.

PERSONALITY & VOICE:
- Warm, steady, and genuinely caring
- Speak like a knowledgeable friend who actually listens
- Homie, not hype - no corporate speak or buzzwords
- Show quiet confidence backed by the user's actual life data
- Be proactive about remembering important things without being pushy

CORE IDENTITY:
When asked who you are or what you do, respond like this:
"I'm Debo - your personal intelligence layer. I remember what you tell me, connect patterns across your journals and experiences, and help you reflect on your life. Think of me as your memory palace and reflective companion."

MEMORY SOURCE:
- Your memory source is the same memory system the user manages at /dashboard/memories.
- Use get_memories when personal context would help.
- Use add_memory only when the user clearly asks you to remember something, or after they approve your offer to remember it.
- Never store greetings, test messages, jokes, or throwaway chat as memories.

STRATEGIC TOOL USAGE:
CRITICAL: When the user asks about their past, preferences, experiences, or anything personal, you MUST first retrieve relevant data using search_journals, get_memories, or get_timeline before answering. Never claim to know something you haven't verified.

PRIMARY TOOL - get_info:
ALWAYS call this FIRST when the user:
- Starts a new conversation or session
- Asks about their life, patterns, history
- Wants a check-in or status update
- Asks about their journal, memories, experiences
- Any complex question requiring their personal context

The get_info tool gives you the complete picture: all journals, memories, patterns, timeline, and emotional insights. This is your foundation for every response.

TOOL HIERARCHY (use in this order for personal context):
1. get_info - Full life documentary (do this first for context)
2. get_memories + get_timeline - Quick lookup of specific memory/timeline
3. search_journals - Semantic search across journals
4. ask_debo - Natural conversation with full memory context
5. add_memory - Only when user explicitly wants something remembered

WHEN TO CREATE/UPDATE JOURNALS:
- The user asks you to write something down
- The user describes a significant experience or insight
- The user is processing emotions or making decisions (offer to save)
- The user explicitly mentions wanting something recorded
- NEVER auto-save without asking first

WHEN TO ADD MEMORIES:
- The user explicitly says "remember this" or "I want to remember"
- The user approves your offer to remember a significant durable fact
- The user shares a preference, commitment, or important relationship
- Ask permission: "Want me to remember that for future reference?"

PATTERN ANALYSIS (query_graph):
Use this when:
- User asks "what patterns do you see in my..."
- User wants insights about recurring themes
- User is going through a transition and wants perspective
- User asks about emotional trends or growth areas

CONTEXT IMPORTS:
When the user imports from ChatGPT, Claude, Cursor, or other AI exports:
1. Use import_ai_context to absorb the data
2. Summarize what was imported and its significance
3. Offer to extract action items or insights
4. Connect to existing context where relevant

RESPONSE STYLE:
- For simple questions: 1-3 sentences, direct answer
- For personal context questions: Ground your response in actual data
- For journal/life questions: Reference specific entries or memories
- For pattern analysis: Present insights with supporting evidence
- For emotional support: Validate then offer reflection
- For action items: Be specific and follow-up friendly

NEVER:
- Pretend to know something you haven't retrieved
- Mention internal tool names, schemas, or implementation details
- Make up facts about the user without evidence
- Be preachy or overly formal
- Use excessive emojis or try-hard enthusiasm

CONVERSATION FLOW:
- Simple chat: Natural, concise, helpful
- Journaling: Warm, encouraging, thoughtful
- Memory questions: Evidence-backed, humble about gaps
- Pattern analysis: Thoughtful, insightful, actionable
- Emotional support: Present but not overbearing`;

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
  createdAt?: unknown;
  date?: unknown;
  label?: unknown;
  sourceType?: unknown;
};

type GraphNodeResult = {
  id?: unknown;
};

type GraphSentiment = "positive" | "negative" | "neutral" | "growth";
type UIMessagePart = UIMessage["parts"][number];

type IncomingChatMessage = {
  id?: unknown;
  role?: unknown;
  metadata?: unknown;
  parts?: unknown;
  content?: unknown;
  text?: unknown;
};

function isMeaningfulJournalContent(content: string, explicitlyRequested = false) {
  const normalized = content.trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const casualGreeting = /^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|k|hmm|test)[!.?\s]*$/i;

  if (casualGreeting.test(normalized)) return false;
  if (explicitlyRequested) return normalized.length >= 8 && words.length >= 2;

  return normalized.length >= 40 && words.length >= 6;
}

export function createDeboRuntimeTools(userId: string, options: CreateToolOptions = {}) {
  const baseTools = {
    createJournalTool: {
      description: "Create a new journal entry only when the user explicitly asks to save one. Never use this for greetings, casual chat, or short messages.",
      inputSchema: z.object({
        content: z.string().min(1).describe("The journal content."),
        title: z.string().optional().describe("An optional journal title."),
        tags: z.array(z.string()).optional().describe("Tags for the journal entry."),
        mediaUrl: z.string().optional().describe("Optional video/audio URL to attach (r2:// or https://)."),
        explicitlyRequested: z.boolean().optional().default(false).describe("True only when the user clearly asked to save or create a journal entry."),
      }),
      execute: async (input: { content: string; title?: string; tags?: string[]; mediaUrl?: string; explicitlyRequested?: boolean }) => {
        if (!input.explicitlyRequested || !isMeaningfulJournalContent(input.content, input.explicitlyRequested)) {
          return {
            success: false,
            skipped: true,
            reason: "Journal creation requires a clear user request and meaningful journal content.",
          };
        }

        const { saveJournal } = await import("@/actions/journals");
        let finalContent = input.content;
        if (input.mediaUrl) {
          const mediaType = input.mediaUrl.match(/\.(webm|mp4|mp3|wav|ogg)$/i)?.[1] || "media";
          const isVideo = ["webm", "mp4"].includes(mediaType);
          finalContent += `\n\n---\nAttached ${isVideo ? "video" : "audio"}: ${input.mediaUrl}`;
        }
        return saveJournal(finalContent, undefined, input.title, userId, input.tags);
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
    updateJournalTool: {
      description: "Update an existing journal entry with new content, title, or tags.",
      inputSchema: z.object({
        id: z.string().describe("The journal ID to update."),
        content: z.string().optional().describe("New journal content (merges with existing)."),
        title: z.string().optional().describe("New title for the journal."),
        tags: z.array(z.string()).optional().describe("New tags for the journal."),
        mediaUrl: z.string().optional().describe("Optional video/audio URL to attach (r2:// or https://)."),
        append: z.boolean().optional().default(false).describe("Append to existing content instead of replacing."),
      }),
      execute: async (input: { id: string; content?: string; title?: string; tags?: string[]; mediaUrl?: string; append?: boolean }) => {
        const { getJournal, saveJournal } = await import("@/actions/journals");
        const existing = await getJournal(input.id, userId);
        if (!existing) throw new Error("Journal not found");

        let finalContent = existing.content;
        if (input.mediaUrl) {
          const mediaType = input.mediaUrl.match(/\.(webm|mp4|mp3|wav|ogg)$/i)?.[1] || "media";
          const isVideo = ["webm", "mp4"].includes(mediaType);
          finalContent += `\n\n---\nAttached ${isVideo ? "video" : "audio"}: ${input.mediaUrl}`;
        }

        if (input.content) {
          finalContent = input.append ? `${existing.content}\n\n${input.content}` : input.content;
        }

        return saveJournal(finalContent, input.id, input.title || existing.title || undefined, userId, input.tags ?? (existing.tags ?? undefined));
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
      description: "Add a durable memory fact or preference to the same store shown at /dashboard/memories. Only use after a clear user request or approval.",
      inputSchema: z.object({
        fact: z.string().min(1).describe("The memory to store."),
      }),
      execute: async (input: { fact: string }) => {
        const { addMemory } = await import("@/actions/memories");
        return addMemory(input.fact, userId);
      },
    },
    getInfoTool: {
      description: "Get comprehensive life documentary of the user - all impactful events, patterns, and key information in a single readable article. This is the primary tool to understand the user's life context. Use this FIRST before other tools.",
      inputSchema: z.object({
        focus: z.string().optional().describe("Optional focus area: 'memories', 'journals', 'patterns', 'all'."),
        depth: z.enum(["brief", "detailed", "full"]).optional().default("detailed").describe("Detail level of the documentary."),
      }),
      execute: async (input: { focus?: string; depth?: "brief" | "detailed" | "full" }) => {
        const { getMemories } = await import("@/actions/memories");
        const { getJournals } = await import("@/actions/journals");
        const { queryGraph } = await import("@/lib/life/graph");
        const { getLifeTimeline } = await import("@/lib/life/timeline");

        const depth = input.depth || "detailed";
        const limit = depth === "brief" ? 10 : depth === "full" ? 100 : 30;

        // Get all data
        const memories = await getMemories("", limit, 0, userId);
        const journals = await getJournals("desc", limit, 0, userId);
        const timeline = await getLifeTimeline(userId, "daily");
        const patterns = await queryGraph("What are the main patterns and important events in my life?", userId);

        // Build comprehensive documentary
        const content = buildLifeDocumentary({
          memories: (memories.success ? memories.data ?? [] : []) as Array<{ content?: unknown; sourceType?: unknown; createdAt?: unknown }>,
          journals: journals as Array<{ title?: unknown; content?: unknown; createdAt?: unknown; tags?: unknown }>,
          timeline: timeline as Array<{ date?: unknown; label?: unknown; summary?: unknown }>,
          patterns,
          focus: input.focus || "all",
          depth,
        });

        return {
          documentary: content,
          stats: {
            memories: memories.success ? memories.data?.length ?? 0 : 0,
            journals: journals.length,
            timelineDays: (timeline as Array<unknown>).length,
            topEmotions: patterns.topEmotions?.slice(0, 5).map((e: { name?: unknown }) => e.name) || [],
          },
          generatedAt: new Date().toISOString(),
        };
      },
    },
    getMemoriesTool: {
      description: "Query persistent memories and facts about the user from the same store shown at /dashboard/memories.",
      inputSchema: z.object({
        query: z.string().optional().default(""),
        limit: z.coerce.number().min(1).max(20).optional().default(5),
      }),
      execute: async (input: { query?: string; limit?: number }) => {
        const { getMemories } = await import("@/actions/memories");
        const memories = await getMemories(input.query ?? "", input.limit ?? 5, 0, userId);
        if (!memories.success) return { error: memories.error || "Unable to fetch memories" };

        return ((memories.data ?? []) as MemoryResultItem[]).map((memory) => ({
          id: memory.id,
          content: memory.content,
          date: memory.date || memory.createdAt,
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
    // Connector tools - for integrating external apps with Debo
    listConnectorsTool: {
      description: "List all connected apps/services (Slack, Discord, Notion, etc.) that sync with Debo.",
      inputSchema: z.object({}),
      execute: async () => {
        const { listConnectors } = await import("@/actions/connectors");
        return listConnectors(userId);
      },
    },
    addConnectorTool: {
      description: "Connect a new app/service to Debo (Slack, Discord, Notion, Linear, Gmail, Calendar, GitHub, etc.).",
      inputSchema: z.object({
        name: z.string().min(1).describe("Display name for this connector."),
        connectorType: z.enum(["slack", "discord", "notion", "linear", "gmail", "calendar", "github", "trello", "asana", "jira", "custom"]),
        apiKey: z.string().optional().describe("API key for the service."),
        webhookUrl: z.string().optional().describe("Webhook URL for receiving events."),
        webhookSecret: z.string().optional().describe("Webhook secret for verification."),
        baseUrl: z.string().optional().describe("Base URL for custom connectors."),
      }),
      execute: async (input: {
        name: string;
        connectorType: "slack" | "discord" | "notion" | "linear" | "gmail" | "calendar" | "github" | "trello" | "asana" | "jira" | "custom";
        apiKey?: string;
        webhookUrl?: string;
        webhookSecret?: string;
        baseUrl?: string;
      }) => {
        const { createConnector } = await import("@/actions/connectors");
        return createConnector(userId, {
          name: input.name,
          connectorType: input.connectorType,
          apiKey: input.apiKey,
          webhookUrl: input.webhookUrl,
          webhookSecret: input.webhookSecret,
          baseUrl: input.baseUrl,
        });
      },
    },
    removeConnectorTool: {
      description: "Disconnect an app/service from Debo.",
      inputSchema: z.object({
        connectorId: z.string().describe("The connector ID to remove."),
      }),
      execute: async (input: { connectorId: string }) => {
        const { deleteConnector } = await import("@/actions/connectors");
        return deleteConnector(userId, input.connectorId);
      },
    },
    syncConnectorTool: {
      description: "Trigger a manual sync of a connected app/service with Debo.",
      inputSchema: z.object({
        connectorId: z.string().describe("The connector ID to sync."),
      }),
      execute: async (input: { connectorId: string }) => {
        const { syncConnector } = await import("@/actions/connectors");
        return syncConnector(userId, input.connectorId);
      },
    },
    getConnectorHealthTool: {
      description: "Get the health status of all connected apps/services.",
      inputSchema: z.object({}),
      execute: async () => {
        const { getConnectorHealth } = await import("@/actions/connectors");
        return getConnectorHealth(userId);
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
  messages: unknown;
  maxSteps?: number;
}) {
  const messages = normalizeChatMessages(input.messages);
  
  let systemPrompt = DEBO_SYSTEM_PROMPT;
  
  // Inject context from the same memory store used by /dashboard/memories.
  try {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
        const query = lastMessage.parts.map(p => p.type === 'text' ? p.text : '').join(' ');
        if (query) {
            const { getMemories } = await import("@/actions/memories");
            const memories = await getMemories(query, 10, 0, input.userId);
            const memoriesList = memories.success ? memories.data ?? [] : [];
            
            if (memoriesList.length > 0) {
                const contextStrs = memoriesList.map((m: any) => `- ${m.content}`);
                systemPrompt += `\n\n### RELEVANT MEMORIES FOR THIS CONVERSATION:\n${contextStrs.join('\n')}\n(Use these facts about the user to personalize your response.)`;
            }
        }
    }
  } catch (err) {
      console.error("Mem0 context retrieval failed:", err);
  }

  return streamText({
    model: getChatModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages, {
      ignoreIncompleteToolCalls: true,
    }),
    tools: createDeboAiTools(input.userId),
    stopWhen: stepCountIs(input.maxSteps ?? 4),
  });
}

export function normalizeChatMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((message, index) => normalizeChatMessage(message, index))
    .filter((message): message is UIMessage => Boolean(message));
}

function normalizeChatMessage(value: unknown, index: number): UIMessage | null {
  if (!value || typeof value !== "object") return null;

  const message = value as IncomingChatMessage;
  const role = normalizeRole(message.role);
  if (!role) return null;

  const parts = normalizeMessageParts(message);
  if (parts.length === 0) return null;

  return {
    id: typeof message.id === "string" && message.id.trim() ? message.id : createMessageId(index),
    role,
    ...(message.metadata && typeof message.metadata === "object"
      ? { metadata: message.metadata }
      : {}),
    parts,
  };
}

function normalizeRole(value: unknown): UIMessage["role"] | null {
  return value === "system" || value === "user" || value === "assistant" ? value : null;
}

function normalizeMessageParts(message: IncomingChatMessage): UIMessagePart[] {
  if (Array.isArray(message.parts)) {
    return message.parts.map(normalizeMessagePart).filter(isMessagePart);
  }

  if (Array.isArray(message.content)) {
    return message.content.map(normalizeMessagePart).filter(isMessagePart);
  }

  const text =
    typeof message.content === "string"
      ? message.content
      : typeof message.text === "string"
        ? message.text
        : "";

  return text.trim() ? [{ type: "text", text }] : [];
}

function normalizeMessagePart(value: unknown): UIMessagePart | null {
  if (typeof value === "string") {
    return value.trim() ? { type: "text", text: value } : null;
  }

  if (!value || typeof value !== "object") return null;

  const part = value as {
    type?: unknown;
    text?: unknown;
    content?: unknown;
    url?: unknown;
    mediaType?: unknown;
  };

  if (part.type === "text" && typeof part.text === "string") {
    return { type: "text", text: part.text };
  }

  if (typeof part.text === "string") {
    return { type: "text", text: part.text };
  }

  if (typeof part.content === "string") {
    return { type: "text", text: part.content };
  }

  if (part.type === "file" && typeof part.url === "string" && typeof part.mediaType === "string") {
    return value as UIMessagePart;
  }

  return typeof part.type === "string" ? (value as UIMessagePart) : null;
}

function isMessagePart(value: UIMessagePart | null): value is UIMessagePart {
  return Boolean(value);
}

function createMessageId(index: number) {
  return `msg-${index}-${crypto.randomUUID()}`;
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

type DocumentaryInput = {
  memories: Array<{ content?: unknown; label?: unknown; sourceType?: unknown; date?: unknown; createdAt?: unknown }>;
  journals: Array<{ title?: unknown; content?: unknown; createdAt?: unknown; tags?: unknown }>;
  timeline: Array<{ date?: unknown; label?: unknown; summary?: unknown }>;
  patterns: { insights?: unknown[]; topEmotions?: unknown[] };
  focus: string;
  depth: string;
};

function buildLifeDocumentary(input: DocumentaryInput): string {
  const { memories, journals, timeline, patterns, focus } = input;

  const sections: string[] = [];

  // Title
  sections.push("# LIFE DOCUMENTARY\n");
  sections.push("*Generated from your journal entries, memories, and patterns.*\n");

  // Identity & Key Facts
  const facts = memories.filter(m => {
    const label = m.label || m.sourceType;
    return label === "fact" || label === "person";
  });
  if (facts.length > 0) {
    sections.push("## KEY FACTS ABOUT THE USER\n");
    facts.slice(0, 20).forEach(f => {
      const content = String(f.content || "");
      const dateValue = f.date || f.createdAt;
      const date = dateValue ? new Date(String(dateValue)).toLocaleDateString() : "";
      sections.push(`- **${content}**${date ? ` (${date})` : ""}\n`);
    });
    sections.push("\n");
  }

  // Recent Journals
  if (focus === "all" || focus === "journals") {
    sections.push("## RECENT JOURNAL ENTRIES\n");
    journals.slice(0, 15).forEach(j => {
      const title = String(j.title || "Untitled");
      const date = j.createdAt ? new Date(String(j.createdAt)).toLocaleDateString() : "";
      const content = String(j.content || "").substring(0, 300);
      const tags = Array.isArray(j.tags) ? j.tags.join(", ") : "";
      sections.push(`### ${title}\n`);
      if (date) sections.push(`*${date}*${tags ? ` | ${tags}` : ""}\n`);
      sections.push(`${content}${content.length >= 300 ? "..." : ""}\n\n`);
    });
  }

  // Timeline
  if (focus === "all" || focus === "patterns") {
    sections.push("## LIFE TIMELINE\n");
    timeline.slice(0, 30).forEach(t => {
      const date = String(t.date || "");
      const label = String(t.label || "");
      const summary = String(t.summary || "");
      sections.push(`**${date}** - ${label}\n`);
      if (summary) sections.push(`  ${summary}\n`);
    });
    sections.push("\n");
  }

  // Patterns
  const insights = patterns.insights as string[] | undefined;
  const emotions = patterns.topEmotions as Array<{ name?: unknown; count?: unknown }> | undefined;

  if (focus === "all" || focus === "patterns") {
    sections.push("## LIFE PATTERNS & INSIGHTS\n");

    if (emotions && emotions.length > 0) {
      sections.push("### Emotional Patterns\n");
      emotions.forEach(e => {
        sections.push(`- ${e.name}: ${e.count} occurrences\n`);
      });
      sections.push("\n");
    }

    if (insights && insights.length > 0) {
      sections.push("### Key Insights\n");
      insights.forEach((insight, i) => {
        sections.push(`${i + 1}. ${insight}\n`);
      });
      sections.push("\n");
    }
  }

  return sections.join("\n");
}
