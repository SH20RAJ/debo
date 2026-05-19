import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.get("/", async (c) => {
  const ctx = getAppContext(c);
  const type = c.req.query("type");
  const conditions = [eq(sources.userId, ctx.userId)];
  if (type) conditions.push(eq(sources.type, type as any));
  const rows = await db.select().from(sources).where(and(...conditions)).orderBy(desc(sources.createdAt));
  return c.json(rows);
});

app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(sources).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    type: body.type, title: body.title, description: body.description, status: "draft", origin: body.origin || "manual",
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
  const [updated] = await db.update(sources).set({ ...body, updatedAt: new Date().toISOString() }).where(and(eq(sources.id, id), eq(sources.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

app.delete("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [deleted] = await db.update(sources).set({ status: "deleted", deletedAt: new Date().toISOString() }).where(and(eq(sources.id, id), eq(sources.userId, ctx.userId))).returning();
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;
