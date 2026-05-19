import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@debo/db";
import { chatThreads, chatMessages } from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.get("/threads", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db.select().from(chatThreads).where(eq(chatThreads.userId, ctx.userId)).orderBy(desc(chatThreads.updatedAt));
  return c.json(rows);
});

app.post("/threads", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(chatThreads).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId, title: body.title,
  }).returning();
  return c.json(created, 201);
});

app.get("/threads/:id/messages", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const [thread] = await db.select().from(chatThreads).where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);
  const rows = await db.select().from(chatMessages).where(eq(chatMessages.threadId, threadId)).orderBy(chatMessages.createdAt);
  return c.json(rows);
});

app.post("/threads/:id/messages", async (c) => {
  const ctx = getAppContext(c);
  const threadId = c.req.param("id");
  const body = await c.req.json();
  const [thread] = await db.select().from(chatThreads).where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, ctx.userId)));
  if (!thread) return c.json({ error: "Not found" }, 404);
  const [created] = await db.insert(chatMessages).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    threadId, role: body.role, content: body.content,
  }).returning();
  return c.json(created, 201);
});

export default app;
