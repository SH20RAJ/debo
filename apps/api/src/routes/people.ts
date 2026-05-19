import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { people, personMentions } from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.get("/", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db.select().from(people).where(eq(people.userId, ctx.userId)).orderBy(desc(people.lastMentionedAt));
  return c.json(rows);
});

app.get("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [person] = await db.select().from(people).where(and(eq(people.id, id), eq(people.userId, ctx.userId)));
  if (!person) return c.json({ error: "Not found" }, 404);
  const mentions = await db.select().from(personMentions).where(and(eq(personMentions.personId, id), eq(personMentions.userId, ctx.userId))).orderBy(desc(personMentions.createdAt));
  return c.json({ ...person, mentions });
});

app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(people).values({ id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId, name: body.name, relationship: body.relationship, company: body.company, role: body.role, notes: body.notes }).returning();
  return c.json(created, 201);
});

app.patch("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(people).set({ ...body, updatedAt: new Date().toISOString() }).where(and(eq(people.id, id), eq(people.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

export default app;
