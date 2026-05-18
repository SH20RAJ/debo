import "server-only";

import { db } from "@debo/db";
import { chats, messages } from "@debo/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export const ACTIVE_THREAD_COOKIE = "debo_active_chat_thread";

const MAX_THREAD_ID_LENGTH = 160;

export type ChatThread = typeof chats.$inferSelect;
export type ChatMessageRow = typeof messages.$inferSelect;

export type ChatHistoryStorageRow = {
  id: string;
  parent_id: string | null;
  format: string;
  content: Record<string, unknown>;
};

export function normalizeThreadId(threadId: unknown) {
  if (typeof threadId !== "string") return null;
  const trimmed = threadId.trim();
  if (!trimmed || trimmed === "new") return null;
  if (trimmed.length > MAX_THREAD_ID_LENGTH) return null;
  if (/[\/\\\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

export function resolveRequestedThreadId(
  requestedThreadId: unknown,
  currentThreadId?: string | null
) {
  if (requestedThreadId === "current") return normalizeThreadId(currentThreadId);
  return normalizeThreadId(requestedThreadId);
}

export function makeDefaultThreadTitle(content: unknown) {
  const text = extractMessageText(content).replace(/\s+/g, " ").trim();
  if (!text) return "New Chat";
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}

export async function listChatThreads(userId: string, limit = 50) {
  return db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: [desc(chats.updatedAt)],
    limit,
  });
}

export async function getChatThread(userId: string, threadId: string) {
  return db.query.chats.findFirst({
    where: and(eq(chats.id, threadId), eq(chats.userId, userId)),
  });
}

export async function ensureChatThread(
  userId: string,
  threadId?: string | null,
  title?: string | null
) {
  const id = normalizeThreadId(threadId) ?? crypto.randomUUID();
  const cleanTitle = title?.trim() || null;

  await db
    .insert(chats)
    .values({
      id,
      userId,
      title: cleanTitle,
    })
    .onConflictDoNothing({ target: chats.id });

  const thread = await getChatThread(userId, id);
  if (!thread) {
    throw new Error("Thread id already exists for another user");
  }

  return thread;
}

export async function renameChatThread(
  userId: string,
  threadId: string,
  title?: string | null
) {
  const thread = await getChatThread(userId, threadId);
  if (!thread) return null;

  await db
    .update(chats)
    .set({ title: title?.trim() || null, updatedAt: new Date() })
    .where(eq(chats.id, threadId));

  return getChatThread(userId, threadId);
}

export async function deleteChatThread(userId: string, threadId: string) {
  const thread = await getChatThread(userId, threadId);
  if (!thread) return false;

  await db.delete(messages).where(eq(messages.chatId, threadId));
  await db.delete(chats).where(eq(chats.id, threadId));
  return true;
}

export async function listChatMessages(userId: string, threadId: string) {
  const thread = await getChatThread(userId, threadId);
  if (!thread) return null;

  return db.query.messages.findMany({
    where: eq(messages.chatId, threadId),
    orderBy: [asc(messages.createdAt)],
  });
}

export async function persistChatStorageMessage(input: {
  userId: string;
  threadId: string;
  id: string;
  parentId: string | null;
  format: string;
  content: unknown;
}) {
  const id = typeof input.id === "string" ? input.id.trim() : "";
  const threadId = normalizeThreadId(input.threadId);
  if (!id || !threadId) {
    throw new Error("Missing threadId or message id");
  }

  const thread = await ensureChatThread(input.userId, threadId);
  const existingMessage = await db.query.messages.findFirst({
    where: eq(messages.id, id),
  });

  if (existingMessage && existingMessage.chatId !== thread.id) {
    const ownerThread = await getChatThread(input.userId, existingMessage.chatId);
    if (!ownerThread) {
      throw new Error("Message id already exists for another user");
    }
  }

  const role = extractMessageRole(input.content);
  const storedContent = JSON.stringify(input.content ?? {});
  const storedMetadata = JSON.stringify({
    parentId: input.parentId,
    format: input.format || "ai-sdk/v6",
  });

  if (existingMessage) {
    await db
      .update(messages)
      .set({
        chatId: thread.id,
        role,
        content: storedContent,
        metadata: storedMetadata,
      })
      .where(eq(messages.id, id));
  } else {
    await db.insert(messages).values({
      id,
      chatId: thread.id,
      role,
      content: storedContent,
      metadata: storedMetadata,
    });
  }

  await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, thread.id));

  if (!thread.title && role === "user") {
    await db
      .update(chats)
      .set({ title: makeDefaultThreadTitle(input.content), updatedAt: new Date() })
      .where(eq(chats.id, thread.id));
  }
}

export async function persistPlainChatExchange(input: {
  userId: string;
  threadId?: string | null;
  userText: string;
  assistantText: string;
  title?: string | null;
  source?: string;
}) {
  const thread = await ensureChatThread(input.userId, input.threadId, input.title);
  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  await persistChatStorageMessage({
    userId: input.userId,
    threadId: thread.id,
    id: userMessageId,
    parentId: null,
    format: "ai-sdk/v6",
    content: makeAiSdkTextContent("user", input.userText, input.source),
  });

  await persistChatStorageMessage({
    userId: input.userId,
    threadId: thread.id,
    id: assistantMessageId,
    parentId: userMessageId,
    format: "ai-sdk/v6",
    content: makeAiSdkTextContent("assistant", input.assistantText, input.source),
  });

  return {
    thread,
    userMessageId,
    assistantMessageId,
  };
}

export function serializeChatMessage(row: ChatMessageRow): ChatHistoryStorageRow {
  const metadata = safeJson<Record<string, unknown>>(row.metadata, {});
  const parsedContent = safeJson<Record<string, unknown>>(row.content, {
    role: row.role,
    parts: [{ type: "text", text: row.content, state: "done" }],
  });

  return {
    id: row.id,
    parent_id: typeof metadata.parentId === "string" ? metadata.parentId : null,
    format: typeof metadata.format === "string" ? metadata.format : "ai-sdk/v6",
    content: normalizeAiSdkContent(parsedContent, row.role),
  };
}

export function makeAiSdkTextContent(
  role: "system" | "user" | "assistant",
  text: string,
  source?: string
) {
  return {
    role,
    metadata: source ? { source } : {},
    parts: [{ type: "text", text, state: "done" }],
  };
}

export function extractMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object") return "";

  const value = content as {
    content?: unknown;
    parts?: unknown;
    text?: unknown;
  };

  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;

  const parts = Array.isArray(value.parts)
    ? value.parts
    : Array.isArray(value.content)
      ? value.content
      : [];

  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

function extractMessageRole(content: unknown) {
  if (content && typeof content === "object") {
    const role = (content as { role?: unknown }).role;
    if (role === "system" || role === "assistant" || role === "user" || role === "tool") {
      return role;
    }
  }

  return "user";
}

function normalizeAiSdkContent(content: Record<string, unknown>, fallbackRole: string) {
  const role = content.role === "system" || content.role === "assistant" || content.role === "user"
    ? content.role
    : fallbackRole === "assistant" || fallbackRole === "system"
      ? fallbackRole
      : "user";
  const parts = Array.isArray(content.parts)
    ? content.parts
    : [{ type: "text", text: extractMessageText(content), state: "done" }];

  return {
    ...content,
    role,
    parts,
  };
}

function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
