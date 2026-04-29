"use server";

import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, asc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createChat(title?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const chatId = crypto.randomUUID();
  await db.insert(chats).values({
    id: chatId,
    userId: session.user.id,
    title: title || "New Conversation",
  });

  revalidatePath("/dashboard");
  return chatId;
}

export async function getChatHistory(chatId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, session.user.id)),
  });
  if (!chat) throw new Error("Chat not found or unauthorized");

  return await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: [asc(messages.createdAt)],
  });
}

export async function addChatMessage(
  chatId: string,
  role: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // Verify ownership
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, session.user.id)),
  });
  if (!chat) throw new Error("Chat not found or unauthorized");

  const messageId = crypto.randomUUID();
  await db.insert(messages).values({
    id: messageId,
    chatId,
    role,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });

  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)));

  return messageId;
}

export async function getUserChats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  return await db.query.chats.findMany({
    where: eq(chats.userId, session.user.id),
    orderBy: [desc(chats.updatedAt)],
  });
}

export async function deleteChat(chatId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // Messages will be deleted by cascade if defined, otherwise manual delete
  await db.delete(messages).where(eq(messages.chatId, chatId));
  await db.delete(chats).where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)));

  revalidatePath("/dashboard");
  return { success: true };
}
