import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { connectorAccounts } from "@debo/db/schema";
import { getAppContext } from "../lib/context";

const app = new Hono();

app.get("/", async (c) => {
  const ctx = getAppContext(c);
  const rows = await db.select().from(connectorAccounts).where(eq(connectorAccounts.userId, ctx.userId)).orderBy(desc(connectorAccounts.createdAt));
  return c.json(rows);
});

app.post("/connect", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const [created] = await db.insert(connectorAccounts).values({
    id: crypto.randomUUID(), userId: ctx.userId, workspaceId: ctx.workspaceId,
    provider: body.provider, externalAccountId: body.externalAccountId, status: "connected",
  }).returning();
  return c.json(created, 201);
});

app.delete("/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const [updated] = await db.update(connectorAccounts).set({ status: "disconnected", updatedAt: new Date().toISOString() }).where(and(eq(connectorAccounts.id, id), eq(connectorAccounts.userId, ctx.userId))).returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;
