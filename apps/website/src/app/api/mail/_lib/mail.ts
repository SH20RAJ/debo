import { NextResponse } from "next/server";
import { db } from "@debo/db";
import {
  deboMailAddresses,
  deboMailMessages,
  deboMailParticipants,
  deboMailThreads,
  sources,
  users,
  workspaces,
} from "@debo/db/schema";
import { and, desc, eq, inArray, isNotNull, isNull } from "@/server/mail/drizzle";
import { requireAuth, type AuthUser } from "@/lib/auth";

export type MailIdentity = {
  user: AuthUser;
  workspaceId: string;
  username: string;
  address: string;
};

const ADDRESS_DOMAIN = "debo.life";

export function normalizeDeboAddress(address: string) {
  return address.trim().toLowerCase();
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function isValidDeboUsername(username: string) {
  return /^[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$/.test(username);
}

export function isDeboAddress(address: string) {
  return normalizeDeboAddress(address).endsWith(`@${ADDRESS_DOMAIN}`);
}

function usernameFromUser(user: AuthUser) {
  const emailPrefix = user.email.split("@")[0];
  const candidate = normalizeUsername(emailPrefix || user.name || user.id)
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    .slice(0, 28);

  return isValidDeboUsername(candidate) ? candidate : `user-${user.id.slice(0, 8).toLowerCase()}`;
}

export async function requireMailIdentity(req: Request): Promise<MailIdentity | NextResponse> {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const workspaceId = user.id;
  const now = new Date().toISOString();

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email || `${user.id}@${ADDRESS_DOMAIN}`,
      name: user.name || user.email || "Debo User",
      avatarUrl: user.imageUrl,
      updatedAt: now,
    })
    .onConflictDoNothing();

  await db
    .insert(workspaces)
    .values({
      id: workspaceId,
      ownerUserId: user.id,
      name: `${user.name || "My"}'s Debo`,
      type: "personal",
      updatedAt: now,
    })
    .onConflictDoNothing();

  const [existingAddress] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.userId, user.id))
    .limit(1);

  if (existingAddress) {
    return {
      user,
      workspaceId: existingAddress.workspaceId,
      username: existingAddress.username,
      address: existingAddress.address,
    };
  }

  const baseUsername = usernameFromUser(user);
  const candidates = [baseUsername, `${baseUsername}-${user.id.slice(0, 6).toLowerCase()}`];

  for (const username of candidates) {
    const address = `${username}@${ADDRESS_DOMAIN}`;

    try {
      const [created] = await db
        .insert(deboMailAddresses)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          workspaceId,
          username,
          address,
          isPrimary: 1,
          updatedAt: now,
        })
        .returning();

      return {
        user,
        workspaceId,
        username: created.username,
        address: created.address,
      };
    } catch {
      // Try the next deterministic fallback if the desired address is taken.
    }
  }

  return NextResponse.json({ error: "Could not create a Debo Mail address" }, { status: 409 });
}

export async function getThreadForUser(threadId: string, userId: string) {
  const [row] = await db
    .select({
      thread: deboMailThreads,
      participant: deboMailParticipants,
    })
    .from(deboMailParticipants)
    .innerJoin(deboMailThreads, eq(deboMailParticipants.threadId, deboMailThreads.id))
    .where(and(eq(deboMailParticipants.threadId, threadId), eq(deboMailParticipants.userId, userId)))
    .limit(1);

  return row;
}

export async function listThreadsForUser(userId: string, folder: string) {
  const conditions = [eq(deboMailParticipants.userId, userId)];

  if (folder === "inbox") {
    conditions.push(eq(deboMailParticipants.role, "recipient"));
    conditions.push(isNull(deboMailParticipants.archivedAt));
    conditions.push(isNull(deboMailParticipants.deletedAt));
  } else if (folder === "sent") {
    conditions.push(eq(deboMailParticipants.role, "sender"));
    conditions.push(isNull(deboMailParticipants.deletedAt));
  } else if (folder === "archived") {
    conditions.push(isNotNull(deboMailParticipants.archivedAt));
  } else {
    conditions.push(isNull(deboMailParticipants.deletedAt));
  }

  const rows = await db
    .select({
      thread: deboMailThreads,
      participant: deboMailParticipants,
    })
    .from(deboMailParticipants)
    .innerJoin(deboMailThreads, eq(deboMailParticipants.threadId, deboMailThreads.id))
    .where(and(...conditions))
    .orderBy(desc(deboMailThreads.lastMessageAt), desc(deboMailThreads.createdAt));

  if (rows.length === 0) return [];

  const threadIds = rows.map((row) => row.thread.id);
  const messages = await db
    .select()
    .from(deboMailMessages)
    .where(and(inArray(deboMailMessages.threadId, threadIds), isNull(deboMailMessages.deletedAt)))
    .orderBy(desc(deboMailMessages.createdAt));

  const lastMessageByThread = new Map<string, (typeof messages)[number]>();
  for (const message of messages) {
    if (!lastMessageByThread.has(message.threadId)) {
      lastMessageByThread.set(message.threadId, message);
    }
  }

  const memoryThreadIds = new Set(messages.filter((message) => message.isMemorySaved === 1).map((message) => message.threadId));

  return rows
    .map((row) => ({
      ...row.thread,
      participant: row.participant,
      lastMessage: lastMessageByThread.get(row.thread.id) ?? null,
      messageCount: messages.filter((message) => message.threadId === row.thread.id).length,
      memorySavedCount: messages.filter((message) => message.threadId === row.thread.id && message.isMemorySaved === 1).length,
    }))
    .filter((thread) => {
      if (folder === "memory") return memoryThreadIds.has(thread.id);
      if (folder === "drafts" || folder === "starred") return false;
      if (folder === "archived") return Boolean(thread.participant.archivedAt);
      return true;
    });
}

export async function createMailSource(messageId: string, userId: string, workspaceId: string) {
  const [message] = await db
    .select()
    .from(deboMailMessages)
    .where(eq(deboMailMessages.id, messageId))
    .limit(1);

  if (!message) return null;

  if (message.sourceId) {
    const [existing] = await db.select().from(sources).where(eq(sources.id, message.sourceId)).limit(1);
    return existing ?? null;
  }

  const sourceId = crypto.randomUUID();
  const plainText = [
    `From: ${message.senderAddress}`,
    `To: ${message.recipientAddress}`,
    `Subject: ${message.subject}`,
    "",
    message.body,
  ].join("\n");

  const [source] = await db
    .insert(sources)
    .values({
      id: sourceId,
      userId,
      workspaceId,
      type: "debo_mail",
      title: message.subject,
      description: `Debo Mail from ${message.senderAddress}`,
      plainText,
      status: "ready",
      origin: "manual",
      sourceDate: message.createdAt,
      privacyLevel: "private",
      metadataJson: JSON.stringify({ messageId, threadId: message.threadId }),
      updatedAt: new Date().toISOString(),
    })
    .returning();

  await db
    .update(deboMailMessages)
    .set({ isMemorySaved: 1, sourceId })
    .where(eq(deboMailMessages.id, messageId));

  return source;
}
