// src/index.ts
import "dotenv/config";
import { Hono as Hono12 } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";

// src/lib/auth.ts
var MOCK_USER = {
  id: "dev-user-001",
  email: "dev@debo.life",
  name: "Dev User"
};
async function getUser(c) {
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
  }
  return MOCK_USER;
}
async function requireAuth(c, next) {
  const user = await getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", user);
  await next();
}

// src/lib/context.ts
async function contextMiddleware(c, next) {
  const user = c.get("user");
  const ctx = {
    userId: user.id,
    workspaceId: user.id,
    // single-user workspace for now
    user
  };
  c.set("ctx", ctx);
  await next();
}
function getAppContext(c) {
  return c.get("ctx");
}

// src/lib/errors.ts
import { ZodError } from "zod";
var AppError = class extends Error {
  status;
  code;
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
};
var NotFoundError = class extends AppError {
  constructor(resource, id) {
    super(`${resource} ${id} not found`, 404, "NOT_FOUND");
  }
};
function errorHandler(err, c) {
  if (err instanceof ZodError) {
    return c.json(
      { error: "Validation failed", issues: err.issues },
      422
    );
  }
  if (err instanceof AppError) {
    return c.json({ error: err.message, code: err.code }, err.status);
  }
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
}

// src/routes/sources.ts
import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
var app = new Hono();
app.get("/", async (c) => {
  const ctx = getAppContext(c);
  const type = c.req.query("type");
  const conditions = [eq(sources.userId, ctx.userId)];
  if (type) conditions.push(eq(sources.type, type));
  const rows = await db.select().from(sources).where(and(...conditions)).orderBy(desc(sources.createdAt));
  return c.json(rows);
});
app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(sources).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    type: body.type,
    title: body.title,
    description: body.description,
    status: "draft",
    origin: body.origin || "manual"
  }).returning();
  return c.json(created, 201);
});
app.get("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [source] = await db.select().from(sources).where(and(eq(sources.id, id), eq(sources.userId, ctx.userId)));
  if (!source) return c.json({ error: "Not found" }, 404);
  return c.json(source);
});
app.patch("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(sources).set({ ...body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and(eq(sources.id, id), eq(sources.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});
app.delete("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [deleted] = await db.update(sources).set({ status: "deleted", deletedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and(eq(sources.id, id), eq(sources.userId, ctx.userId))).returning();
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});
var sources_default = app;

// src/routes/tasks.ts
import { Hono as Hono2 } from "hono";
import { eq as eq2, desc as desc2, and as and2 } from "drizzle-orm";
import { db as db2 } from "@debo/db";
import { tasks } from "@debo/db/schema";
var app2 = new Hono2();
app2.get("/", async (c) => {
  const ctx = getAppContext(c);
  const status = c.req.query("status");
  const conditions = [eq2(tasks.userId, ctx.userId)];
  if (status) conditions.push(eq2(tasks.status, status));
  const rows = await db2.select().from(tasks).where(and2(...conditions)).orderBy(desc2(tasks.createdAt));
  return c.json(rows);
});
app2.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db2.insert(tasks).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    description: body.description,
    sourceId: body.sourceId,
    dueAt: body.dueAt,
    relatedPersonId: body.relatedPersonId,
    projectId: body.projectId,
    status: body.status || "inbox",
    extractionStatus: body.extractionStatus || "manual"
  }).returning();
  return c.json(created, 201);
});
app2.patch("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db2.update(tasks).set({ ...body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and2(eq2(tasks.id, id), eq2(tasks.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});
app2.post("/:id/approve", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [updated] = await db2.update(tasks).set({ extractionStatus: "extracted_approved", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and2(eq2(tasks.id, id), eq2(tasks.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});
app2.post("/:id/dismiss", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [updated] = await db2.update(tasks).set({ status: "dismissed", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and2(eq2(tasks.id, id), eq2(tasks.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});
var tasks_default = app2;

// src/routes/people.ts
import { Hono as Hono3 } from "hono";
import { eq as eq3, desc as desc3, and as and3 } from "drizzle-orm";
import { db as db3 } from "@debo/db";
import { people, personMentions } from "@debo/db/schema";
var app3 = new Hono3();
app3.get("/", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db3.select().from(people).where(eq3(people.userId, ctx.userId)).orderBy(desc3(people.lastMentionedAt));
  return c.json(rows);
});
app3.get("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [person] = await db3.select().from(people).where(and3(eq3(people.id, id), eq3(people.userId, ctx.userId)));
  if (!person) return c.json({ error: "Not found" }, 404);
  const mentions = await db3.select().from(personMentions).where(and3(eq3(personMentions.personId, id), eq3(personMentions.userId, ctx.userId))).orderBy(desc3(personMentions.createdAt));
  return c.json({ ...person, mentions });
});
app3.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db3.insert(people).values({ id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId, name: body.name, relationship: body.relationship, company: body.company, role: body.role, notes: body.notes }).returning();
  return c.json(created, 201);
});
app3.patch("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db3.update(people).set({ ...body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and3(eq3(people.id, id), eq3(people.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});
var people_default = app3;

// src/routes/projects.ts
import { Hono as Hono4 } from "hono";
import { eq as eq4, desc as desc4, and as and4 } from "drizzle-orm";
import { db as db4 } from "@debo/db";
import { projects } from "@debo/db/schema";
var app4 = new Hono4();
app4.get("/", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db4.select().from(projects).where(eq4(projects.userId, ctx.userId)).orderBy(desc4(projects.createdAt));
  return c.json(rows);
});
app4.get("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [project] = await db4.select().from(projects).where(and4(eq4(projects.id, id), eq4(projects.userId, ctx.userId)));
  if (!project) return c.json({ error: "Not found" }, 404);
  return c.json(project);
});
app4.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db4.insert(projects).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    name: body.name,
    description: body.description,
    color: body.color
  }).returning();
  return c.json(created, 201);
});
var projects_default = app4;

// src/routes/ask.ts
import { Hono as Hono5 } from "hono";
var app5 = new Hono5();
app5.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const question = body.question || "";
  return c.json({
    id: `ans_${Date.now()}`,
    question,
    answer: `This is a placeholder answer for: "${question}". The real Ask Debo pipeline will search your memory graph, retrieve relevant sources, and generate a source-backed answer.`,
    citations: [
      { id: "cit_mock_1", sourceType: "journal", title: "Example Source", snippet: "Relevant snippet from one of your sources.", score: 0.92 }
    ],
    confidence: 0,
    userId: ctx.userId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var ask_default = app5;

// src/routes/chat.ts
import { Hono as Hono6 } from "hono";
import { eq as eq5, and as and5, desc as desc5 } from "drizzle-orm";
import { db as db5 } from "@debo/db";
import { chatThreads, chatMessages } from "@debo/db/schema";
var app6 = new Hono6();
app6.get("/threads", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db5.select().from(chatThreads).where(eq5(chatThreads.userId, ctx.userId)).orderBy(desc5(chatThreads.updatedAt));
  return c.json(rows);
});
app6.post("/threads", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db5.insert(chatThreads).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    title: body.title
  }).returning();
  return c.json(created, 201);
});
app6.get("/threads/:id/messages", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const [thread] = await db5.select().from(chatThreads).where(and5(eq5(chatThreads.id, threadId), eq5(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);
  const rows = await db5.select().from(chatMessages).where(eq5(chatMessages.threadId, threadId)).orderBy(chatMessages.createdAt);
  return c.json(rows);
});
app6.post("/threads/:id/messages", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const body = await c.req.json();
  const [thread] = await db5.select().from(chatThreads).where(and5(eq5(chatThreads.id, threadId), eq5(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);
  const [created] = await db5.insert(chatMessages).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    threadId,
    role: body.role,
    content: body.content
  }).returning();
  return c.json(created, 201);
});
var chat_default = app6;

// src/routes/connectors.ts
import { Hono as Hono7 } from "hono";
import { eq as eq6, desc as desc6, and as and6 } from "drizzle-orm";
import { db as db6 } from "@debo/db";
import { connectorAccounts } from "@debo/db/schema";
var app7 = new Hono7();
app7.get("/", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db6.select().from(connectorAccounts).where(eq6(connectorAccounts.userId, ctx.userId)).orderBy(desc6(connectorAccounts.createdAt));
  return c.json(rows);
});
app7.post("/connect", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db6.insert(connectorAccounts).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    provider: body.provider,
    externalAccountId: body.externalAccountId,
    status: "connected"
  }).returning();
  return c.json(created, 201);
});
app7.delete("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [updated] = await db6.update(connectorAccounts).set({ status: "disconnected", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and6(eq6(connectorAccounts.id, id), eq6(connectorAccounts.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});
var connectors_default = app7;

// src/routes/voice.ts
import { Hono as Hono8 } from "hono";
import { nanoid } from "nanoid";
var app8 = new Hono8();
var sessions = /* @__PURE__ */ new Map();
app8.post("/sessions", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const id = nanoid();
  const roomName = body.roomName ?? `debo-voice-${id}`;
  const session = { id, userId: ctx.userId, roomName, status: "active", createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  sessions.set(id, session);
  return c.json(session, 201);
});
app8.get("/sessions", async (c) => {
  const ctx = getAppContext(c);
  return c.json([...sessions.values()].filter((s) => s.userId === ctx.userId));
});
app8.post("/sessions/:id/token", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const session = sessions.get(id);
  if (!session || session.userId !== ctx.userId) return c.json({ error: "Not found" }, 404);
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return c.json({ token: `lk_stub_${nanoid(32)}`, roomName: session.roomName, wsUrl: process.env.LIVEKIT_URL ?? "wss://debo.livekit.cloud" });
  }
  try {
    const { AccessToken } = await import("livekit-server-sdk");
    const at = new AccessToken(apiKey, apiSecret, { identity: ctx.userId, name: ctx.user.name });
    at.addGrant({ roomJoin: true, room: session.roomName, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();
    return c.json({ token, roomName: session.roomName, wsUrl: process.env.LIVEKIT_URL });
  } catch (e) {
    return c.json({ error: "Token generation failed", details: e.message }, 500);
  }
});
var voice_default = app8;

// src/routes/vault.ts
import { Hono as Hono9 } from "hono";
import { nanoid as nanoid2 } from "nanoid";
import { db as db7 } from "@debo/db";
import { eq as eq7, and as and7 } from "drizzle-orm";
import { sources as sources2 } from "@debo/db/schema";
var vaultRouter = new Hono9();
var auditLog = [];
vaultRouter.post("/export", async (c) => {
  const ctx = getAppContext(c);
  const exportId = nanoid2();
  auditLog.push({
    id: nanoid2(),
    userId: ctx.userId,
    action: "export_requested",
    resourceType: "vault",
    resourceId: exportId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  return c.json({
    exportId,
    status: "pending",
    message: "Export has been queued. You will be notified when it is ready.",
    estimatedReadyAt: new Date(Date.now() + 3e5).toISOString()
  }, 202);
});
vaultRouter.delete("/sources/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [source] = await db7.delete(sources2).where(and7(eq7(sources2.id, id), eq7(sources2.userId, ctx.userId))).returning();
  if (!source) throw new NotFoundError("Source", id);
  auditLog.push({
    id: nanoid2(),
    userId: ctx.userId,
    action: "hard_delete",
    resourceType: "source",
    resourceId: id,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  return c.json({ deleted: true, id, hardDelete: true });
});
vaultRouter.get("/audit-log", async (c) => {
  const ctx = getAppContext(c);
  const userLogs = auditLog.filter((entry) => entry.userId === ctx.userId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 100);
  return c.json({ auditLog: userLogs });
});
var vault_default = vaultRouter;

// src/routes/uploads.ts
import { Hono as Hono10 } from "hono";
var app9 = new Hono10();
app9.post("/presign", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const { sourceId, filename, contentType } = body;
  const key = `workspaces/${ctx.workspaceId}/users/${ctx.userId}/sources/${sourceId}/original/${filename}`;
  return c.json({
    uploadUrl: `https://r2.example.com/presigned/${key}`,
    key,
    message: "Presigned URL stub \u2014 configure R2 credentials to enable"
  });
});
app9.get("/download/*", async (c) => {
  const key = c.req.path.replace("/api/uploads/download/", "");
  return c.json({
    downloadUrl: `https://r2.example.com/download/${key}`,
    message: "Download URL stub \u2014 configure R2 credentials to enable"
  });
});
var uploads_default = app9;

// src/routes/mail.ts
import { Hono as Hono11 } from "hono";
import { eq as eq8, desc as desc8, and as and8, or } from "drizzle-orm";
import { db as db8 } from "@debo/db";
import {
  deboMailAddresses,
  deboMailThreads,
  deboMailMessages,
  deboMailParticipants,
  sources as sources3
} from "@debo/db/schema";
var app10 = new Hono11();
var RESERVED_USERNAMES = [
  "admin",
  "support",
  "root",
  "mail",
  "hello",
  "team",
  "founder",
  "debo",
  "noreply",
  "privacy",
  "security",
  "info",
  "help",
  "abuse",
  "postmaster",
  "webmaster",
  "contact",
  "legal",
  "billing"
];
var USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;
app10.get("/address", async (c) => {
  const ctx = getAppContext(c);
  const [address] = await db8.select().from(deboMailAddresses).where(eq8(deboMailAddresses.userId, ctx.userId)).limit(1);
  if (!address) return c.json({ address: null });
  return c.json({ address });
});
app10.post("/address/check", async (c) => {
  const body = await c.req.json();
  const username = (body.username || "").toLowerCase().trim();
  if (!username) return c.json({ available: false, error: "Username is required" });
  if (RESERVED_USERNAMES.includes(username)) return c.json({ available: false, error: "This username is reserved" });
  if (!USERNAME_RE.test(username)) return c.json({ available: false, error: "3-30 chars, lowercase letters, numbers, hyphen, underscore" });
  const [existing] = await db8.select().from(deboMailAddresses).where(eq8(deboMailAddresses.username, username)).limit(1);
  return c.json({ available: !existing });
});
app10.post("/address/claim", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const username = (body.username || "").toLowerCase().trim();
  if (!username) return c.json({ error: "Username is required" }, 400);
  if (RESERVED_USERNAMES.includes(username)) return c.json({ error: "This username is reserved" }, 400);
  if (!USERNAME_RE.test(username)) return c.json({ error: "3-30 chars, lowercase letters, numbers, hyphen, underscore" }, 400);
  const [existing] = await db8.select().from(deboMailAddresses).where(eq8(deboMailAddresses.userId, ctx.userId)).limit(1);
  if (existing) return c.json({ error: "You already have a Debo address" }, 400);
  const [taken] = await db8.select().from(deboMailAddresses).where(eq8(deboMailAddresses.username, username)).limit(1);
  if (taken) return c.json({ error: "Username is already taken" }, 409);
  const address = `${username}@debo.life`;
  const [created] = await db8.insert(deboMailAddresses).values({
    id: crypto.randomUUID(),
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    username,
    address,
    isPrimary: 1
  }).returning();
  return c.json({ address: created }, 201);
});
app10.get("/threads", async (c) => {
  const ctx = getAppContext(c);
  const folder = c.req.query("folder") || "inbox";
  const rows = await db8.select({
    thread: deboMailThreads,
    participant: deboMailParticipants
  }).from(deboMailParticipants).innerJoin(deboMailThreads, eq8(deboMailParticipants.threadId, deboMailThreads.id)).where(
    and8(
      eq8(deboMailParticipants.userId, ctx.userId),
      folder === "archived" ? or(eq8(deboMailParticipants.role, "sender"), eq8(deboMailParticipants.role, "recipient")) : eq8(deboMailParticipants.role, "recipient")
      // simplified: inbox = recipient role
    )
  ).orderBy(desc8(deboMailThreads.lastMessageAt));
  const threads = await Promise.all(
    rows.map(async (row) => {
      const [lastMsg] = await db8.select().from(deboMailMessages).where(eq8(deboMailMessages.threadId, row.thread.id)).orderBy(desc8(deboMailMessages.createdAt)).limit(1);
      return {
        ...row.thread,
        participant: row.participant,
        lastMessage: lastMsg || null
      };
    })
  );
  return c.json({ threads });
});
app10.get("/threads/:threadId", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");
  const [participant] = await db8.select().from(deboMailParticipants).where(
    and8(
      eq8(deboMailParticipants.threadId, threadId),
      eq8(deboMailParticipants.userId, ctx.userId)
    )
  ).limit(1);
  if (!participant) return c.json({ error: "Thread not found" }, 404);
  const [thread] = await db8.select().from(deboMailThreads).where(eq8(deboMailThreads.id, threadId)).limit(1);
  const messages = await db8.select().from(deboMailMessages).where(eq8(deboMailMessages.threadId, threadId)).orderBy(deboMailMessages.createdAt);
  return c.json({ thread, messages, participant });
});
app10.post("/send", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const { to, subject, body: messageBody } = body;
  if (!to || !subject || !messageBody) {
    return c.json({ error: "To, subject, and body are required" }, 400);
  }
  if (!to.endsWith("@debo.life")) {
    return c.json({ error: "Debo Mail only works between Debo users. External email delivery is not supported." }, 400);
  }
  const recipientUsername = to.replace("@debo.life", "");
  const [senderAddress] = await db8.select().from(deboMailAddresses).where(eq8(deboMailAddresses.userId, ctx.userId)).limit(1);
  if (!senderAddress) return c.json({ error: "You need to claim a Debo address first" }, 400);
  const [recipientAddress] = await db8.select().from(deboMailAddresses).where(eq8(deboMailAddresses.username, recipientUsername)).limit(1);
  if (!recipientAddress) return c.json({ error: "Recipient not found. Only Debo users can receive Debo Mail." }, 404);
  const threadId = crypto.randomUUID();
  const messageId = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db8.insert(deboMailThreads).values({
    id: threadId,
    workspaceId: ctx.workspaceId,
    subject,
    createdByUserId: ctx.userId,
    lastMessageAt: now
  });
  await db8.insert(deboMailMessages).values({
    id: messageId,
    threadId,
    senderUserId: ctx.userId,
    senderAddress: senderAddress.address,
    recipientUserId: recipientAddress.userId,
    recipientAddress: to,
    subject,
    body: messageBody,
    status: "sent"
  });
  await db8.insert(deboMailParticipants).values([
    {
      id: crypto.randomUUID(),
      threadId,
      userId: ctx.userId,
      address: senderAddress.address,
      role: "sender"
    },
    {
      id: crypto.randomUUID(),
      threadId,
      userId: recipientAddress.userId,
      address: to,
      role: "recipient"
    }
  ]);
  return c.json({ threadId, messageId }, 201);
});
app10.post("/threads/:threadId/read", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db8.update(deboMailParticipants).set({ lastReadAt: now }).where(
    and8(
      eq8(deboMailParticipants.threadId, threadId),
      eq8(deboMailParticipants.userId, ctx.userId)
    )
  );
  await db8.update(deboMailMessages).set({ status: "read", readAt: now }).where(
    and8(
      eq8(deboMailMessages.threadId, threadId),
      eq8(deboMailMessages.recipientUserId, ctx.userId),
      eq8(deboMailMessages.status, "delivered")
    )
  );
  return c.json({ success: true });
});
app10.post("/threads/:threadId/archive", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");
  await db8.update(deboMailParticipants).set({ archivedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(
    and8(
      eq8(deboMailParticipants.threadId, threadId),
      eq8(deboMailParticipants.userId, ctx.userId)
    )
  );
  return c.json({ success: true });
});
app10.delete("/threads/:threadId", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("threadId");
  await db8.update(deboMailParticipants).set({ deletedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(
    and8(
      eq8(deboMailParticipants.threadId, threadId),
      eq8(deboMailParticipants.userId, ctx.userId)
    )
  );
  return c.json({ success: true });
});
app10.post("/messages/:messageId/save-to-memory", async (c) => {
  const ctx = getAppContext(c);
  const messageId = c.req.param("messageId");
  const [message] = await db8.select().from(deboMailMessages).where(eq8(deboMailMessages.id, messageId)).limit(1);
  if (!message) return c.json({ error: "Message not found" }, 404);
  const sourceId = crypto.randomUUID();
  await db8.insert(sources3).values({
    id: sourceId,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    type: "debo_mail",
    title: message.subject,
    status: "ready",
    origin: "manual",
    plainText: `From: ${message.senderAddress}
To: ${message.recipientAddress}
Subject: ${message.subject}

${message.body}`
  });
  await db8.update(deboMailMessages).set({ isMemorySaved: 1, sourceId }).where(eq8(deboMailMessages.id, messageId));
  return c.json({ sourceId, success: true });
});
var mail_default = app10;

// src/index.ts
var app11 = new Hono12();
app11.use("*", logger());
app11.use("*", requestId());
app11.use("*", cors({ origin: ["http://localhost:3000", "https://app.debo.life", "https://debo-app.shraj.workers.dev"] }));
app11.onError(errorHandler);
app11.get("/health", (c) => c.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
app11.use("/api/*", requireAuth);
app11.use("/api/*", contextMiddleware);
app11.route("/api/sources", sources_default);
app11.route("/api/tasks", tasks_default);
app11.route("/api/people", people_default);
app11.route("/api/projects", projects_default);
app11.route("/api/ask", ask_default);
app11.route("/api/chat", chat_default);
app11.route("/api/connectors", connectors_default);
app11.route("/api/voice", voice_default);
app11.route("/api/vault", vault_default);
app11.route("/api/uploads", uploads_default);
app11.route("/api/mail", mail_default);
app11.notFound((c) => c.json({ error: "Not found" }, 404));
var index_default = app11;
var port = Number(process.env.PORT) || 3001;
console.log(`Debo API running on http://localhost:${port}`);
if (typeof Bun !== "undefined") {
  Bun.serve({ port, fetch: app11.fetch });
} else {
  import("@hono/node-server").then(({ serve }) => {
    serve({ fetch: app11.fetch, port });
  }).catch(() => {
    console.warn("Install @hono/node-server for Node.js support");
  });
}
export {
  index_default as default
};
