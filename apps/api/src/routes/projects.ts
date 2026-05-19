import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { projects } from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.get("/", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db.select().from(projects).where(eq(projects.userId, ctx.userId)).orderBy(desc(projects.createdAt));
  return c.json(rows);
});

app.get("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [project] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, ctx.userId)));
  if (!project) return c.json({ error: "Not found" }, 404);
  return c.json(project);
});

app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(projects).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    name: body.name, description: body.description, color: body.color,
  }).returning();
  return c.json(created, 201);
});

export default app;
