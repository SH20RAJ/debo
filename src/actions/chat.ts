"use server";

import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { resolveUserId } from "./auth-sync";
import { eq, desc, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createChat(title?: string) {
  const userId = await resolveUserId();
  if (!userId) throw new Error("Unauthorized");

  const chatId = crypto.randomUUID();
  await db.insert(chats).values({
    id: chatId,
    userId,
    title: title || "New Conversation",
  });

  revalidatePath("/dashboard");
  return chatId;
}

export async function getChatHistory(chatId: string) {
  const userId = await resolveUserId();
  if (!userId) throw new Error("Unauthorized");

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
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
  metadata?: Record<string, unknown>,
) {
  const userId = await resolveUserId();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
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
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

  return messageId;
}

export async function getUserChats() {
  const userId = await resolveUserId();
  if (!userId) return [];

  return await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: [desc(chats.updatedAt)],
  });
}

export async function deleteChat(chatId: string) {
  const userId = await resolveUserId();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(messages).where(eq(messages.chatId, chatId));
  await db
    .delete(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

  revalidatePath("/dashboard");
  return { success: true };
}
