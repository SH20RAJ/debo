import { and, desc, eq, inArray, isNull, or } from "@/server/mail/drizzle";
import { db } from "@debo/db";
import {
  deboMailAddresses,
  deboMailMessages,
  deboMailParticipants,
  deboMailThreads,
  sources,
  users,
} from "@debo/db/schema";

export type MailFolder = "inbox" | "sent" | "starred" | "archived" | "drafts" | "memory";

export function normalizeDeboAddress(value: string) {
  return value.trim().toLowerCase();
}

export function usernameFromEmail(email: string) {
  return normalizeDeboAddress(email).split("@")[0].replace(/[^a-z0-9._-]/g, "").slice(0, 32);
}

export function isDeboAddress(value: string) {
  return /^[a-z0-9._-]+@debo\.life$/.test(normalizeDeboAddress(value));
}

export async function ensureMailAddress(user: { id: string; email: string }) {
  const existing = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.userId, user.id))
    .limit(1);

  if (existing[0]) return existing[0];

  const base = usernameFromEmail(user.email || user.id) || "user";
  let username = base;
  let address = `${username}@debo.life`;

  for (let i = 1; i < 20; i += 1) {
    const taken = await db
      .select({ id: deboMailAddresses.id })
      .from(deboMailAddresses)
      .where(eq(deboMailAddresses.address, address))
      .limit(1);
    if (!taken[0]) break;
    username = `${base}${i}`;
    address = `${username}@debo.life`;
  }

  const [created] = await db
    .insert(deboMailAddresses)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      workspaceId: user.id,
      username,
      address,
    })
    .returning();

  return created;
}

export async function findUserByDeboAddress(address: string) {
  const normalized = normalizeDeboAddress(address);
  const rows = await db
    .select({
      userId: deboMailAddresses.userId,
      address: deboMailAddresses.address,
      name: users.name,
      email: users.email,
    })
    .from(deboMailAddresses)
    .innerJoin(users, eq(users.id, deboMailAddresses.userId))
    .where(eq(deboMailAddresses.address, normalized))
    .limit(1);

  return rows[0] ?? null;
}

export async function listThreads(userId: string, folder: MailFolder = "inbox") {
  const rows = await db
    .select({
      id: deboMailThreads.id,
      subject: deboMailThreads.subject,
      lastMessageAt: deboMailThreads.lastMessageAt,
      createdAt: deboMailThreads.createdAt,
      participantRole: deboMailParticipants.role,
      lastReadAt: deboMailParticipants.lastReadAt,
      archivedAt: deboMailParticipants.archivedAt,
      deletedAt: deboMailParticipants.deletedAt,
    })
    .from(deboMailParticipants)
    .innerJoin(deboMailThreads, eq(deboMailThreads.id, deboMailParticipants.threadId))
    .where(
      folder === "archived"
        ? eq(deboMailParticipants.userId, userId)
        : and(eq(deboMailParticipants.userId, userId), isNull(deboMailParticipants.deletedAt)),
    )
    .orderBy(desc(deboMailThreads.lastMessageAt), desc(deboMailThreads.createdAt));

  const filtered = rows.filter((row) => {
    if (folder === "sent") return row.participantRole === "sender" && !row.deletedAt;
    if (folder === "archived") return Boolean(row.archivedAt) && !row.deletedAt;
    if (folder === "memory") return !row.deletedAt;
    return row.participantRole === "recipient" && !row.archivedAt && !row.deletedAt;
  });

  if (filtered.length === 0) return [];

  const threadIds = filtered.map((row) => row.id);
  const messages = await db
    .select()
    .from(deboMailMessages)
    .where(inArray(deboMailMessages.threadId, threadIds))
    .orderBy(desc(deboMailMessages.createdAt));

  return filtered
    .map((thread) => {
      const lastMessage = messages.find((message) => message.threadId === thread.id) ?? null;
      if (folder === "memory" && lastMessage?.isMemorySaved !== 1) return null;
      return {
        id: thread.id,
        subject: thread.subject,
        lastMessageAt: thread.lastMessageAt,
        createdAt: thread.createdAt,
        lastMessage,
        participant: {
          role: thread.participantRole,
          lastReadAt: thread.lastReadAt,
          archivedAt: thread.archivedAt,
          deletedAt: thread.deletedAt,
        },
      };
    })
    .filter(Boolean);
}

export async function getThreadForUser(userId: string, threadId: string) {
  const participant = await db
    .select()
    .from(deboMailParticipants)
    .where(and(eq(deboMailParticipants.threadId, threadId), eq(deboMailParticipants.userId, userId)))
    .limit(1);

  if (!participant[0] || participant[0].deletedAt) return null;

  const [thread] = await db
    .select()
    .from(deboMailThreads)
    .where(eq(deboMailThreads.id, threadId))
    .limit(1);

  const messages = await db
    .select()
    .from(deboMailMessages)
    .where(eq(deboMailMessages.threadId, threadId))
    .orderBy(deboMailMessages.createdAt);

  return { thread, messages, participant: participant[0] };
}

export async function sendDeboMail(input: {
  senderUserId: string;
  senderAddress: string;
  recipientUserId: string;
  recipientAddress: string;
  subject: string;
  body: string;
  threadId?: string;
}) {
  const now = new Date().toISOString();
  let threadId = input.threadId;

  if (!threadId) {
    threadId = crypto.randomUUID();
    await db.insert(deboMailThreads).values({
      id: threadId,
      workspaceId: input.senderUserId,
      subject: input.subject,
      createdByUserId: input.senderUserId,
      lastMessageAt: now,
    });

    await db.insert(deboMailParticipants).values([
      {
        id: crypto.randomUUID(),
        threadId,
        userId: input.senderUserId,
        address: input.senderAddress,
        role: "sender",
        lastReadAt: now,
      },
      {
        id: crypto.randomUUID(),
        threadId,
        userId: input.recipientUserId,
        address: input.recipientAddress,
        role: "recipient",
      },
    ]);
  }

  const [message] = await db
    .insert(deboMailMessages)
    .values({
      id: crypto.randomUUID(),
      threadId,
      senderUserId: input.senderUserId,
      senderAddress: input.senderAddress,
      recipientUserId: input.recipientUserId,
      recipientAddress: input.recipientAddress,
      subject: input.subject,
      body: input.body,
      status: "delivered",
    })
    .returning();

  await db
    .update(deboMailThreads)
    .set({ lastMessageAt: now, updatedAt: now })
    .where(eq(deboMailThreads.id, threadId));

  return message;
}

export async function saveMailMessageToMemory(userId: string, messageId: string) {
  const rows = await db
    .select()
    .from(deboMailMessages)
    .where(
      and(
        eq(deboMailMessages.id, messageId),
        or(eq(deboMailMessages.senderUserId, userId), eq(deboMailMessages.recipientUserId, userId)),
      ),
    )
    .limit(1);

  const message = rows[0];
  if (!message) return null;
  if (message.sourceId) return { message, sourceId: message.sourceId };

  const sourceId = crypto.randomUUID();
  await db.insert(sources).values({
    id: sourceId,
    userId,
    workspaceId: userId,
    type: "debo_mail",
    title: message.subject,
    plainText: [
      `From: ${message.senderAddress}`,
      `To: ${message.recipientAddress}`,
      `Subject: ${message.subject}`,
      "",
      message.body,
    ].join("\n"),
    status: "ready",
    origin: "manual",
  });

  const [updated] = await db
    .update(deboMailMessages)
    .set({ isMemorySaved: 1, sourceId })
    .where(eq(deboMailMessages.id, messageId))
    .returning();

  return { message: updated, sourceId };
}
