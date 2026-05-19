import { Hono } from "hono";
import { eq, desc, and, or } from "drizzle-orm";
import { db } from "@debo/db";
import {
  deboMailAddresses,
  deboMailThreads,
  deboMailMessages,
  deboMailParticipants,
  sources,
} from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

// Reserved usernames
const RESERVED_USERNAMES = [
  "admin", "support", "root", "mail", "hello", "team", "founder",
  "debo", "noreply", "privacy", "security", "info", "help", "abuse",
  "postmaster", "webmaster", "contact", "legal", "billing",
];

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

// ─── Address endpoints ─────────────────────────────────────────────────────

// Get current user's Debo Mail address
app.get("/address", async (c) => {
  const ctx = getAppContext(c);
  const [address] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.userId, ctx.userId))
    .limit(1);
  if (!address) return c.json({ address: null });
  return c.json({ address });
});

// Check if a username is available
app.post("/address/check", async (c) => {
  const body = await c.req.json();
  const username = (body.username || "").toLowerCase().trim();

  if (!username) return c.json({ available: false, error: "Username is required" });
  if (RESERVED_USERNAMES.includes(username)) return c.json({ available: false, error: "This username is reserved" });
  if (!USERNAME_RE.test(username)) return c.json({ available: false, error: "3-30 chars, lowercase letters, numbers, hyphen, underscore" });

  const [existing] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.username, username))
    .limit(1);

  return c.json({ available: !existing });
});

// Claim a Debo Mail address
app.post("/address/claim", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const username = (body.username || "").toLowerCase().trim();

  if (!username) return c.json({ error: "Username is required" }, 400);
  if (RESERVED_USERNAMES.includes(username)) return c.json({ error: "This username is reserved" }, 400);
  if (!USERNAME_RE.test(username)) return c.json({ error: "3-30 chars, lowercase letters, numbers, hyphen, underscore" }, 400);

  // Check if user already has an address
  const [existing] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.userId, ctx.userId))
    .limit(1);
  if (existing) return c.json({ error: "You already have a Debo address" }, 400);

  // Check if username is taken
  const [taken] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.username, username))
    .limit(1);
  if (taken) return c.json({ error: "Username is already taken" }, 409);

  const address = `${username}@debo.life`;
  const [created] = await db
    .insert(deboMailAddresses)
    .values({
      id: crypto.randomUUID(),
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      username,
      address,
      isPrimary: 1,
    })
    .returning();

  return c.json({ address: created }, 201);
});

// ─── Thread endpoints ──────────────────────────────────────────────────────

// List threads for current user
app.get("/threads", async (c) => {
  const ctx = getAppContext(c);
  const folder = c.req.query("folder") || "inbox";

  // Get threads where user is a participant
  const rows = await db
    .select({
      thread: deboMailThreads,
      participant: deboMailParticipants,
    })
    .from(deboMailParticipants)
    .innerJoin(deboMailThreads, eq(deboMailParticipants.threadId, deboMailThreads.id))
    .where(
      and(
        eq(deboMailParticipants.userId, ctx.userId),
        folder === "archived"
          ? or(eq(deboMailParticipants.role, "sender"), eq(deboMailParticipants.role, "recipient"))
          : eq(deboMailParticipants.role, "recipient"), // simplified: inbox = recipient role
      )
    )
    .orderBy(desc(deboMailThreads.lastMessageAt));

  // Get last message for each thread
  const threads = await Promise.all(
    rows.map(async (row) => {
      const [lastMsg] = await db
        .select()
        .from(deboMailMessages)
        .where(eq(deboMailMessages.threadId, row.thread.id))
        .orderBy(desc(deboMailMessages.createdAt))
        .limit(1);

      return {
        ...row.thread,
        participant: row.participant,
        lastMessage: lastMsg || null,
      };
    })
  );

  return c.json({ threads });
});

// Get thread detail with all messages
app.get("/threads/:threadId", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");

  // Verify user is a participant
  const [participant] = await db
    .select()
    .from(deboMailParticipants)
    .where(
      and(
        eq(deboMailParticipants.threadId, threadId),
        eq(deboMailParticipants.userId, ctx.userId),
      )
    )
    .limit(1);

  if (!participant) return c.json({ error: "Thread not found" }, 404);

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

  return c.json({ thread, messages, participant });
});

// ─── Send endpoint ─────────────────────────────────────────────────────────

app.post("/send", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const { to, subject, body: messageBody } = body;

  if (!to || !subject || !messageBody) {
    return c.json({ error: "To, subject, and body are required" }, 400);
  }

  // Validate recipient format
  if (!to.endsWith("@debo.life")) {
    return c.json({ error: "Debo Mail only works between Debo users. External email delivery is not supported." }, 400);
  }

  const recipientUsername = to.replace("@debo.life", "");

  // Get sender address
  const [senderAddress] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.userId, ctx.userId))
    .limit(1);
  if (!senderAddress) return c.json({ error: "You need to claim a Debo address first" }, 400);

  // Get recipient address
  const [recipientAddress] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.username, recipientUsername))
    .limit(1);
  if (!recipientAddress) return c.json({ error: "Recipient not found. Only Debo users can receive Debo Mail." }, 404);

  // Create thread
  const threadId = crypto.randomUUID();
  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(deboMailThreads).values({
    id: threadId,
    workspaceId: ctx.workspaceId,
    subject,
    createdByUserId: ctx.userId,
    lastMessageAt: now,
  });

  // Create message
  await db.insert(deboMailMessages).values({
    id: messageId,
    threadId,
    senderUserId: ctx.userId,
    senderAddress: senderAddress.address,
    recipientUserId: recipientAddress.userId,
    recipientAddress: to,
    subject,
    body: messageBody,
    status: "sent",
  });

  // Create participants
  await db.insert(deboMailParticipants).values([
    {
      id: crypto.randomUUID(),
      threadId,
      userId: ctx.userId,
      address: senderAddress.address,
      role: "sender",
    },
    {
      id: crypto.randomUUID(),
      threadId,
      userId: recipientAddress.userId,
      address: to,
      role: "recipient",
    },
  ]);

  return c.json({ threadId, messageId }, 201);
});

// ─── Thread actions ────────────────────────────────────────────────────────

// Mark thread as read
app.post("/threads/:threadId/read", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");
  const now = new Date().toISOString();

  await db
    .update(deboMailParticipants)
    .set({ lastReadAt: now })
    .where(
      and(
        eq(deboMailParticipants.threadId, threadId),
        eq(deboMailParticipants.userId, ctx.userId),
      )
    );

  // Mark unread messages as read
  await db
    .update(deboMailMessages)
    .set({ status: "read", readAt: now })
    .where(
      and(
        eq(deboMailMessages.threadId, threadId),
        eq(deboMailMessages.recipientUserId, ctx.userId),
        eq(deboMailMessages.status, "delivered"),
      )
    );

  return c.json({ success: true });
});

// Archive thread
app.post("/threads/:threadId/archive", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");

  await db
    .update(deboMailParticipants)
    .set({ archivedAt: new Date().toISOString() })
    .where(
      and(
        eq(deboMailParticipants.threadId, threadId),
        eq(deboMailParticipants.userId, ctx.userId),
      )
    );

  return c.json({ success: true });
});

// Delete (soft) thread for user
app.delete("/threads/:threadId", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");

  await db
    .update(deboMailParticipants)
    .set({ deletedAt: new Date().toISOString() })
    .where(
      and(
        eq(deboMailParticipants.threadId, threadId),
        eq(deboMailParticipants.userId, ctx.userId),
      )
    );

  return c.json({ success: true });
});

// ─── Save to memory ────────────────────────────────────────────────────────

app.post("/messages/:messageId/save-to-memory", async (c) => {
  const ctx = getAppContext(c);
  const messageId = c.req.param("messageId");

  const [message] = await db
    .select()
    .from(deboMailMessages)
    .where(eq(deboMailMessages.id, messageId))
    .limit(1);

  if (!message) return c.json({ error: "Message not found" }, 404);

  // Create a source for this mail
  const sourceId = crypto.randomUUID();
  await db.insert(sources).values({
    id: sourceId,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    type: "debo_mail",
    title: message.subject,
    status: "ready",
    origin: "manual",
    plainText: `From: ${message.senderAddress}\nTo: ${message.recipientAddress}\nSubject: ${message.subject}\n\n${message.body}`,
  });

  // Update message
  await db
    .update(deboMailMessages)
    .set({ isMemorySaved: 1, sourceId })
    .where(eq(deboMailMessages.id, messageId));

  return c.json({ sourceId, success: true });
});

export default app;
