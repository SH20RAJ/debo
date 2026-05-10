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
type UIMessagePart = UIMessage["parts"][number];

type IncomingChatMessage = {
  id?: unknown;
  role?: unknown;
  metadata?: unknown;
  parts?: unknown;
  content?: unknown;
  text?: unknown;
};

export function createDeboRuntimeTools(userId: string, options: CreateToolOptions = {}) {
  const baseTools = {
    createJournalTool: {
      description: "Create a new journal entry for the user.",
      inputSchema: z.object({
        content: z.string().min(1).describe("The journal content."),
        title: z.string().optional().describe("An optional journal title."),
        tags: z.array(z.string()).optional().describe("Tags for the journal entry."),
        mediaUrl: z.string().optional().describe("Optional video/audio URL to attach (r2:// or https://)."),
      }),
      execute: async (input: { content: string; title?: string; tags?: string[]; mediaUrl?: string }) => {
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
      description: "Add a durable memory fact or preference.",
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
        const { getRelevantMemories } = await import("@/lib/memory/query");
        const { getJournals } = await import("@/actions/journals");
        const { queryGraph } = await import("@/lib/life/graph");
        const { getLifeTimeline } = await import("@/lib/life/timeline");

        const depth = input.depth || "detailed";
        const limit = depth === "brief" ? 10 : depth === "full" ? 100 : 30;

        // Get all data
        const memories = await getRelevantMemories(userId, "");
        const journals = await getJournals("desc", limit, 0, userId);
        const timeline = await getLifeTimeline(userId, "daily");
        const patterns = await queryGraph("What are the main patterns and important events in my life?", userId);

        // Build comprehensive documentary
        const content = buildLifeDocumentary({
          memories: memories.items as Array<{ content?: unknown; label?: unknown; date?: unknown }>,
          journals: journals as Array<{ title?: unknown; content?: unknown; createdAt?: unknown; tags?: unknown }>,
          timeline: timeline as Array<{ date?: unknown; label?: unknown; summary?: unknown }>,
          patterns,
          focus: input.focus || "all",
          depth,
        });

        return {
          documentary: content,
          stats: {
            memories: memories.items.length,
            journals: journals.length,
            timelineDays: (timeline as Array<unknown>).length,
            topEmotions: patterns.topEmotions?.slice(0, 5).map((e: { name?: unknown }) => e.name) || [],
          },
          generatedAt: new Date().toISOString(),
        };
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

  return streamText({
    model: getChatModel(),
    system: DEBO_SYSTEM_PROMPT,
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
  memories: Array<{ content?: unknown; label?: unknown; date?: unknown }>;
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
  const facts = memories.filter(m => m.label === "fact" || m.label === "person");
  if (facts.length > 0) {
    sections.push("## KEY FACTS ABOUT THE USER\n");
    facts.slice(0, 20).forEach(f => {
      const content = String(f.content || "");
      const date = f.date ? new Date(String(f.date)).toLocaleDateString() : "";
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
