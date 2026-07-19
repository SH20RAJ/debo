import { NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { requireSession, apiError, newId } from "@/lib/api-helpers";
import { db } from "@debo/db";
import {
  chatThreads,
  chatMessages,
  answerCitations,
  tasks,
  sources,
  deboMailMessages,
  connectorAccounts,
  connectorSyncRuns,
  customMcpServers,
  memoryChunks,
} from "@debo/db/schema";
import { eq, and, or, ilike, ne } from "drizzle-orm";
import { retrieveMemory } from "@/server/langgraph/nodes/retrieve-memory.node";
import { classifyOrchestrationIntent } from "@/server/langgraph/nodes/classify-intent.node";
import { resolveProvider } from "@/server/llm/provider";
import { z } from "zod";

export const runtime = "nodejs";

const TARGET_CHUNK_CHARS = 1100;
const MIN_CHUNK_CHARS = 200;

function chunkText(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if (buf.length === 0) {
      buf = p;
      continue;
    }
    if ((buf.length + p.length + 2) <= TARGET_CHUNK_CHARS) {
      buf = `${buf}\n\n${p}`;
    } else {
      chunks.push(buf);
      buf = p;
    }
  }
  if (buf) chunks.push(buf);

  const final: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= TARGET_CHUNK_CHARS) {
      final.push(chunk);
      continue;
    }
    for (let i = 0; i < chunk.length; i += TARGET_CHUNK_CHARS) {
      final.push(chunk.slice(i, i + TARGET_CHUNK_CHARS));
    }
  }

  return final.filter((c) => c.length >= MIN_CHUNK_CHARS || final.length === 1);
}

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: { messages?: any[]; threadId?: string };
  try {
    body = await req.json();
    console.log("ROUTE API BODY:", JSON.stringify(body, null, 2));
  } catch {
    return apiError("invalid_json", 400);
  }

  const rawMessages = body.messages || [];
  if (rawMessages.length === 0) return apiError("messages_required", 400);

  // Extract text from UIMessage format (parts) or legacy format (content)
  function extractText(msg: any): string {
    // UIMessage v6 format: { parts: [{ type: "text", text: "..." }] }
    if (Array.isArray(msg.parts)) {
      return msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text || "")
        .join("\n");
    }
    // Legacy format: { content: "..." }
    if (typeof msg.content === "string") return msg.content;
    return "";
  }

  const lastUserMessage = [...rawMessages].reverse().find((m) => m.role === "user");
  const question = lastUserMessage ? extractText(lastUserMessage) : "";

  // Helper to wrap promises in a strict timeout
  function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<T>((resolve) => {
      timeoutId = setTimeout(() => resolve(fallback), ms);
    });
    return Promise.race([
      promise.then((val) => {
        clearTimeout(timeoutId);
        return val;
      }),
      timeoutPromise,
    ]);
  }

  let threadId = body.threadId;
  let threadExists = false;

  try {
    if (threadId) {
      const existingThread = await withTimeout(
        db
          .select({ id: chatThreads.id })
          .from(chatThreads)
          .where(
            and(
              eq(chatThreads.id, threadId),
              eq(chatThreads.userId, user.id),
              eq(chatThreads.workspaceId, workspaceId),
            ),
          )
          .limit(1),
        3000,
        []
      );

      if (existingThread && existingThread.length > 0) {
        threadExists = true;
      }
    }

    if (!threadId || !threadExists) {
      threadId = newId("thr");
      await withTimeout(
        db.insert(chatThreads).values({
          id: threadId,
          userId: user.id,
          workspaceId,
          mode: "recall",
          title: question.slice(0, 80) || "New Chat",
        }),
        3000,
        null
      );
    }

    // Persist user message to DB (safe, non-blocking)
    try {
      await withTimeout(
        db.insert(chatMessages).values({
          id: newId("msg"),
          userId: user.id,
          workspaceId,
          threadId,
          role: "user",
          content: question,
        }),
        3000,
        null
      );
    } catch (e) {
      console.error("[api/chat] Failed to persist user message to DB:", e);
    }
  } catch (err: any) {
    console.error("[api/chat] Error preparing thread/message in DB:", err);
    return apiError("database_error", 500, { message: err.message });
  }

  const cfg = resolveProvider();
  if (!cfg) {
    return apiError("llm_not_configured", 500);
  }

  const customOpenAI = createOpenAI({
    baseURL: cfg.baseURL,
    apiKey: cfg.apiKey,
  });
  const model = customOpenAI.chat(cfg.chatModel);

  // Perform intent classification to decide if we should retrieve memories (3s timeout)
  const intent = await withTimeout(
    classifyOrchestrationIntent(question),
    3000,
    "general" as const
  );
  console.log(`[api/chat] Classified user question intent: ${intent}`);

  let contextText = "";
  let sourcesFound: any[] = [];

  if (intent === "recall") {
    console.log("[api/chat] Intent is RECALL. Querying vector memory (4s timeout)...");
    const retrieved = await withTimeout(
      retrieveMemory(user.id, question, 8),
      4000,
      { sourcesFound: [], contextText: "" }
    );
    contextText = retrieved.contextText;
    sourcesFound = retrieved.sourcesFound;
  } else {
    console.log(`[api/chat] Intent is ${intent}. Skipping vector memory lookup.`);
  }

  // Build system prompt compiling memory context
  const systemPrompt = [
    `You are Debo, a private AI memory assistant. You answer using the user's stored memory context below or by calling external tools.`,
    `Rules:`,
    `- Cite sources by title and type (e.g., "Journal: Daily Reflection" or "Gmail: Inbox").`,
    `- You have access to external tools (Gmail, Slack, Notion, Tasks, and custom MCPs). If the memory context below does not contain the answer, or if the user asks you to check external accounts/mails/tasks, call the appropriate tools to fetch the information.`,
    `- If no relevant memory exists and no tools provide the answer, say so plainly and offer to help capture it — do not invent memory.`,
    `- Be concise. Use markdown for readability.`,
    `- Separate memory-backed facts from your own reasoning.`,
    contextText.trim()
      ? `\n--- MEMORY CONTEXT ---\n${contextText}\n--- END ---`
      : "\nNo relevant memory found for this question.",
  ].join("\n");

  // Sanitize rawMessages to ensure every message has parts populated (as expected by AI SDK v4/v7 convertToModelMessages)
  const sanitizedMessages = rawMessages.map((msg: any) => ({
    id: msg.id || newId("msg"),
    role: msg.role,
    content: msg.content || "",
    parts: msg.parts || [{ type: "text", text: msg.content || "" }],
  }));

  // Convert UIMessage[] to ModelMessage[] for the LLM
  const modelMessages = await convertToModelMessages(sanitizedMessages);

  // Dynamic tool selection based on intent and question keywords
  const activeTools: Record<string, any> = {};

  if (intent !== "chitchat" && intent !== "general") {
    const lowerQuestion = question.toLowerCase();
    
    // Check if we should expose journal/voice tools
    const needsRecall = 
      intent === "recall" || 
      lowerQuestion.includes("journal") || 
      lowerQuestion.includes("note") || 
      lowerQuestion.includes("memory") || 
      lowerQuestion.includes("thought") || 
      lowerQuestion.includes("voice");
      
    // Check if we should expose task/mail tools
    const needsConnector = 
      intent === "connector" || 
      lowerQuestion.includes("mail") || 
      lowerQuestion.includes("email") || 
      lowerQuestion.includes("gmail") || 
      lowerQuestion.includes("task") || 
      lowerQuestion.includes("todo") || 
      lowerQuestion.includes("to-do") ||
      lowerQuestion.includes("deadline");

    if (needsRecall) {
      activeTools.queryJournals = {
        description: "Search and query your private and public journal logs.",
        parameters: z.object({ query: z.string().optional() }),
        execute: async ({ query }: { query?: string }) => {
          const conditions = [
            eq(sources.userId, user.id),
            eq(sources.workspaceId, workspaceId),
            eq(sources.type, "journal"),
            ne(sources.status, "deleted"),
          ];
          if (query) {
            conditions.push(or(ilike(sources.title, `%${query}%`), ilike(sources.plainText, `%${query}%`)) as any);
          }
          const results = await db
            .select({
              id: sources.id,
              title: sources.title,
              plainText: sources.plainText,
              createdAt: sources.createdAt,
            })
            .from(sources)
            .where(and(...conditions))
            .limit(5);

          return JSON.stringify(
            results.map((r) => ({
              id: r.id,
              title: r.title,
              snippet: r.plainText ? r.plainText.slice(0, 400) : "",
              createdAt: r.createdAt,
            }))
          );
        },
      };

      activeTools.queryVoiceNotes = {
        description: "Search and retrieve transcribed voice notes or recorded phone conversations with Debo.",
        parameters: z.object({ query: z.string().optional() }),
        execute: async ({ query }: { query?: string }) => {
          const conditions = [
            eq(sources.userId, user.id),
            eq(sources.workspaceId, workspaceId),
            or(eq(sources.type, "voice"), eq(sources.type, "audio")),
            ne(sources.status, "deleted"),
          ];
          if (query) {
            conditions.push(or(ilike(sources.title, `%${query}%`), ilike(sources.plainText, `%${query}%`)) as any);
          }
          const results = await db
            .select({
              id: sources.id,
              title: sources.title,
              plainText: sources.plainText,
              createdAt: sources.createdAt,
            })
            .from(sources)
            .where(and(...conditions))
            .limit(5);

          return JSON.stringify(
            results.map((r) => ({
              id: r.id,
              title: r.title,
              snippet: r.plainText ? r.plainText.slice(0, 400) : "",
              createdAt: r.createdAt,
            }))
          );
        },
      };

      activeTools.createJournal = {
        description: "Write and save a new personal journal log entry.",
        parameters: z.object({
          title: z.string().describe("Title of the journal"),
          content: z.string().describe("Body content of the journal"),
        }),
        execute: async ({ title, content }: { title: string; content: string }) => {
          const sourceId = newId("src");
          const [created] = await db
            .insert(sources)
            .values({
              id: sourceId,
              userId: user.id,
              workspaceId,
              type: "journal",
              title: title.trim(),
              plainText: content.trim(),
              status: "ready",
              origin: "manual",
            })
            .returning();

          const chunks = chunkText(content);
          if (chunks.length > 0) {
            const chunkRows = chunks.map((chunk, index) => ({
              id: newId("chk"),
              userId: user.id,
              workspaceId,
              sourceId,
              chunkIndex: index,
              text: chunk,
              tokenCount: Math.ceil(chunk.length / 4),
            }));
            await db.insert(memoryChunks).values(chunkRows);
          }
          return `Success! Journal entry created with ID: ${created.id}`;
        },
      };

      activeTools.updateJournal = {
        description: "Update the title or body content of an existing journal entry.",
        parameters: z.object({
          journalId: z.string().describe("ID of the journal entry"),
          title: z.string().optional().describe("New title"),
          content: z.string().optional().describe("New body content"),
        }),
        execute: async ({ journalId, title, content }: { journalId: string; title?: string; content?: string }) => {
          const [entry] = await db
            .select()
            .from(sources)
            .where(and(eq(sources.id, journalId), eq(sources.userId, user.id), eq(sources.type, "journal")))
            .limit(1);

          if (!entry) return `Journal not found for ID: ${journalId}`;

          const updatedTitle = title?.trim() || entry.title;
          const updatedContent = content?.trim() || entry.plainText || "";

          await db
            .update(sources)
            .set({ title: updatedTitle, plainText: updatedContent, updatedAt: new Date().toISOString() })
            .where(eq(sources.id, journalId));

          if (content) {
            await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
            const chunks = chunkText(updatedContent);
            if (chunks.length > 0) {
              const chunkRows = chunks.map((chunk, index) => ({
                id: newId("chk"),
                userId: user.id,
                workspaceId,
                sourceId: journalId,
                chunkIndex: index,
                text: chunk,
                tokenCount: Math.ceil(chunk.length / 4),
              }));
              await db.insert(memoryChunks).values(chunkRows);
            }
          }
          return `Success! Journal updated successfully.`;
        },
      };

      activeTools.deleteJournal = {
        description: "Delete an existing journal entry.",
        parameters: z.object({
          journalId: z.string().describe("ID of the journal entry"),
        }),
        execute: async ({ journalId }: { journalId: string }) => {
          await db.delete(memoryChunks).where(eq(memoryChunks.sourceId, journalId));
          await db.delete(sources).where(and(eq(sources.id, journalId), eq(sources.userId, user.id), eq(sources.type, "journal")));
          return `Success! Journal entry deleted.`;
        },
      };

      activeTools.captureThought = {
        description: "Capture a simple thought, note, or reference link into the memory graph.",
        parameters: z.object({
          content: z.string().describe("The note or thought text"),
          title: z.string().optional().describe("Optional note title"),
        }),
        execute: async ({ content, title }: { content: string; title?: string }) => {
          const sourceId = newId("src");
          const [created] = await db
            .insert(sources)
            .values({
              id: sourceId,
              userId: user.id,
              workspaceId,
              type: "manual",
              title: title?.trim() || `Thought at ${new Date().toLocaleDateString()}`,
              plainText: content.trim(),
              status: "ready",
              origin: "manual",
            })
            .returning();

          const chunks = chunkText(content);
          if (chunks.length > 0) {
            const chunkRows = chunks.map((chunk, index) => ({
              id: newId("chk"),
              userId: user.id,
              workspaceId,
              sourceId,
              chunkIndex: index,
              text: chunk,
              tokenCount: Math.ceil(chunk.length / 4),
            }));
            await db.insert(memoryChunks).values(chunkRows);
          }
          return `Success! Thought captured under ID: ${created.id}`;
        },
      };
    }

    if (needsConnector) {
      activeTools.queryTasks = {
        description: "Search and query tasks assigned to you or in your inbox.",
        parameters: z.object({ query: z.string().optional() }),
        execute: async ({ query }: { query?: string }) => {
          const conditions = [
            eq(tasks.userId, user.id),
            eq(tasks.workspaceId, workspaceId),
            ne(tasks.status, "dismissed"),
          ];
          if (query) {
            conditions.push(or(ilike(tasks.title, `%${query}%`), ilike(tasks.description, `%${query}%`)) as any);
          }
          const results = await db
            .select({
              id: tasks.id,
              title: tasks.title,
              description: tasks.description,
              status: tasks.status,
              dueAt: tasks.dueAt,
            })
            .from(tasks)
            .where(and(...conditions))
            .limit(10);
          return JSON.stringify(results);
        },
      };

      activeTools.queryMail = {
        description: "Search and retrieve your transactional emails from Debo Mail.",
        parameters: z.object({ query: z.string().optional() }),
        execute: async ({ query }: { query?: string }) => {
          const conditions = [
            or(eq(deboMailMessages.senderUserId, user.id), eq(deboMailMessages.recipientUserId, user.id)),
            ne(deboMailMessages.status, "deleted"),
          ];
          if (query) {
            conditions.push(or(ilike(deboMailMessages.subject, `%${query}%`), ilike(deboMailMessages.body, `%${query}%`)) as any);
          }
          const results = await db
            .select({
              id: deboMailMessages.id,
              subject: deboMailMessages.subject,
              body: deboMailMessages.body,
              createdAt: deboMailMessages.createdAt,
            })
            .from(deboMailMessages)
            .where(and(...conditions))
            .limit(5);

          return JSON.stringify(
            results.map((r) => ({
              id: r.id,
              subject: r.subject,
              bodySnippet: r.body ? r.body.slice(0, 400) : "",
              createdAt: r.createdAt,
            }))
          );
        },
      };

      activeTools.createTask = {
        description: "Create a new task, todo item, or action item.",
        parameters: z.object({
          title: z.string().describe("Task summary"),
          description: z.string().optional().describe("Additional details"),
          dueAt: z.string().optional().describe("ISO timestamp or date string when the task is due"),
        }),
        execute: async ({ title, description, dueAt }: { title: string; description?: string; dueAt?: string }) => {
          const taskId = newId("tsk");
          const [task] = await db
            .insert(tasks)
            .values({
              id: taskId,
              userId: user.id,
              workspaceId,
              title: title.trim(),
              description: description || null,
              status: "todo",
              dueAt: dueAt || null,
              extractionStatus: "manual",
            })
            .returning();

          return `Success! Task created under ID: ${task.id}`;
        },
      };

      activeTools.listConnectors = {
        description: "List the status of connected integrations (Slack, Gmail, Notion, GitHub).",
        parameters: z.object({}),
        execute: async () => {
          const rows = await db
            .select()
            .from(connectorAccounts)
            .where(eq(connectorAccounts.userId, user.id));

          if (rows.length === 0) return "No connectors configured.";
          return rows.map((r) => `- **${r.provider.toUpperCase()}**: Status: ${r.status.toUpperCase()} (Last Synced: ${r.lastSyncedAt || "Never"})`).join("\n");
        },
      };

      activeTools.triggerConnectorSync = {
        description: "Trigger synchronization for a specific connector account provider (e.g. gmail, slack).",
        parameters: z.object({
          provider: z.string().describe("The name of the connector provider (gmail, slack, notion, github)"),
        }),
        execute: async ({ provider }: { provider: string }) => {
          const [connector] = await db
            .select()
            .from(connectorAccounts)
            .where(
              and(
                eq(connectorAccounts.provider, provider.trim().toLowerCase()),
                eq(connectorAccounts.userId, user.id)
              )
            )
            .limit(1);

          if (!connector) return `Connector account not found for provider: ${provider}`;

          const syncRunId = newId("sync");
          await db
            .insert(connectorSyncRuns)
            .values({
              id: syncRunId,
              userId: user.id,
              workspaceId,
              connectorAccountId: connector.id,
              status: "queued",
            });
          return `Success! Synchronization queued for ${provider}. Sync Run ID: ${syncRunId}`;
        },
      };
    }

    // Fetch custom MCP servers and register their tools
    try {
      const servers = await db
        .select()
        .from(customMcpServers)
        .where(
          and(
            eq(customMcpServers.userId, user.id),
            eq(customMcpServers.workspaceId, workspaceId)
          )
        );

      for (const server of servers) {
        let headers: Record<string, string> = {};
        if (server.headersJson) {
          try {
            headers = JSON.parse(server.headersJson);
          } catch {}
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
        const response = await fetch(server.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "tools/list",
            params: {},
            id: 1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const mcpTools = data.result?.tools || [];
          for (const mcpTool of mcpTools) {
            const prefix = server.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
            const toolName = `${prefix}_${mcpTool.name}`;

            const lowerQuestion = question.toLowerCase();
            const shouldInclude = 
              lowerQuestion.includes(mcpTool.name.toLowerCase()) || 
              lowerQuestion.includes(server.name.toLowerCase()) || 
              intent === "recall" || 
              intent === "connector";

            if (shouldInclude) {
              activeTools[toolName] = {
                description: `[MCP: ${server.name}] ${mcpTool.description}`,
                parameters: z.object({
                  arguments: z.record(z.string(), z.any()).optional().describe("Arguments to pass to the MCP tool"),
                }),
                execute: async ({ arguments: args }: { arguments?: any }) => {
                  const callController = new AbortController();
                  const callTimeout = setTimeout(() => callController.abort(), 5000);
                  const callRes = await fetch(server.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...headers },
                    body: JSON.stringify({
                      jsonrpc: "2.0",
                      method: "tools/call",
                      params: {
                        name: mcpTool.name,
                        arguments: args || {},
                      },
                      id: 1,
                    }),
                    signal: callController.signal,
                  });
                  clearTimeout(callTimeout);

                  if (!callRes.ok) return `Error calling remote MCP tool: ${callRes.statusText}`;
                  const callData = await callRes.json();
                  if (callData.error) return `MCP Error: ${callData.error.message}`;
                  const content = callData.result?.content || [];
                  return content.map((c: any) => c.text || "").join("\n") || JSON.stringify(callData.result);
                },
              };
            }
          }
        }
      }
    } catch (err) {
      console.error("[api/chat] Failed loading custom MCP servers:", err);
    }
  }

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(5),
    providerOptions: {
      openai: {
        parallelToolCalls: false,
      },
    },
    tools: activeTools,
    async onFinish({ text }: { text: string }) {
      try {
        // Persist assistant response to DB
        const assistantMessageId = newId("msg");
        await db.insert(chatMessages).values({
          id: assistantMessageId,
          userId: user.id,
          workspaceId,
          threadId,
          role: "assistant",
          content: text,
          metadataJson: JSON.stringify({ sourcesCount: sourcesFound.length }),
        });

        // Save citations for the sources found
        if (sourcesFound.length > 0) {
          await db.insert(answerCitations).values(
            sourcesFound.map((s) => ({
              id: newId("cit"),
              userId: user.id,
              workspaceId,
              messageId: assistantMessageId,
              sourceId: s.id,
              quoteText: s.snippet.slice(0, 200) || null,
              confidence: 0.7,
            }))
          );
        }
      } catch (e) {
        console.error("[api/chat] Failed to save assistant message/citations to DB:", e);
      }
    },
  } as any);

  return result.toUIMessageStreamResponse({
    headers: {
      // Send the thread ID in headers so the client can retrieve or update the search param
      "x-thread-id": threadId,
    },
  });
}
