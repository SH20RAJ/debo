import { NextResponse } from "next/server";
import { streamText } from "ai";
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
} from "@debo/db/schema";
import { eq, and, or, ilike, ne } from "drizzle-orm";
import { retrieveMemory } from "@/server/langgraph/nodes/retrieve-memory.node";
import { resolveProvider } from "@/server/llm/provider";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: { messages?: { role: "user" | "assistant"; content: string }[]; threadId?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("invalid_json", 400);
  }

  const messages = body.messages || [];
  if (messages.length === 0) return apiError("messages_required", 400);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUserMessage?.content || "";

  let threadId = body.threadId;
  if (!threadId) {
    threadId = newId("thr");
    await db.insert(chatThreads).values({
      id: threadId,
      userId: user.id,
      workspaceId,
      mode: "recall",
      title: question.slice(0, 80),
    });
  }

  // Persist user message to DB
  await db.insert(chatMessages).values({
    id: newId("msg"),
    userId: user.id,
    workspaceId,
    threadId,
    role: "user",
    content: question,
  });

  const cfg = resolveProvider();
  if (!cfg) {
    return apiError("llm_not_configured", 500);
  }

  const customOpenAI = createOpenAI({
    baseURL: cfg.baseURL,
    apiKey: cfg.apiKey,
  });
  const model = customOpenAI(cfg.chatModel);

  // Perform memory retrieval
  const retrieved = await retrieveMemory(user.id, question, 8);
  const contextText = retrieved.contextText;
  const sourcesFound = retrieved.sourcesFound;

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

  const result = streamText({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    tools: {
      queryTasks: {
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
          const results = await db.select().from(tasks).where(and(...conditions)).limit(20);
          return JSON.stringify(results);
        },
      } as any,
      queryJournals: {
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
          const results = await db.select().from(sources).where(and(...conditions)).limit(10);
          return JSON.stringify(results);
        },
      } as any,
      queryVoiceNotes: {
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
          const results = await db.select().from(sources).where(and(...conditions)).limit(10);
          return JSON.stringify(results);
        },
      } as any,
      queryMail: {
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
          const results = await db.select().from(deboMailMessages).where(and(...conditions)).limit(15);
          return JSON.stringify(results);
        },
      } as any,
    },
    async onFinish({ text }) {
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
    },
  });

  return result.toTextStreamResponse({
    headers: {
      // Send the thread ID in headers so the client can retrieve or update the search param
      "x-thread-id": threadId,
    },
  });
}
