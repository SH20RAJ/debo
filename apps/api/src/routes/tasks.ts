import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { tasks } from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.get("/", async (c) => {
  const ctx = getAppContext(c);
  const status = c.req.query("status");
  const conditions = [eq(tasks.userId, ctx.userId)];
  if (status) conditions.push(eq(tasks.status, status as any));
  const rows = await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
  return c.json(rows);
});

app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(tasks).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    title: body.title, description: body.description, sourceId: body.sourceId,
    dueAt: body.dueAt, relatedPersonId: body.relatedPersonId, projectId: body.projectId,
    status: body.status || "inbox", extractionStatus: body.extractionStatus || "manual",
  }).returning();
  return c.json(created, 201);
});

app.patch("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(tasks).set({ ...body, updatedAt: new Date().toISOString() }).where(and(eq(tasks.id, id), eq(tasks.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

app.post("/:id/approve", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [updated] = await db.update(tasks).set({ extractionStatus: "extracted_approved", updatedAt: new Date().toISOString() }).where(and(eq(tasks.id, id), eq(tasks.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

app.post("/:id/dismiss", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [updated] = await db.update(tasks).set({ status: "dismissed", updatedAt: new Date().toISOString() }).where(and(eq(tasks.id, id), eq(tasks.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

export default app;
