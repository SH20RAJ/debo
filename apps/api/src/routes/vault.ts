import { Hono } from "hono";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@debo/db";
import { eq, and, desc } from "drizzle-orm";
import { getAppContext } from "../lib/context";
import { NotFoundError } from "../lib/errors";
import { parseBody, parseQuery } from "../lib/validate";
import { sources } from "@debo/db/schema";

const vaultRouter = new Hono();

// In-memory audit log — replace with DB table for production
const auditLog: Array<{
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}> = [];

// POST /export — request data export
vaultRouter.post("/export", async (c) => {
  const ctx = getAppContext(c);

  // TODO: Queue a Trigger.dev job to generate the export
  const exportId = nanoid();

  auditLog.push({
    id: nanoid(),
    userId: ctx.userId,
    action: "export_requested",
    resourceType: "vault",
    resourceId: exportId,
    timestamp: new Date().toISOString(),
  });

  return c.json({
    exportId,
    status: "pending",
    message: "Export has been queued. You will be notified when it is ready.",
    estimatedReadyAt: new Date(Date.now() + 300_000).toISOString(),
  }, 202);
});

// DELETE /sources/:id — hard delete source (vault-level destructive action)
vaultRouter.delete("/sources/:id", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");

  const [source] = await db
    .delete(sources)
    .where(and(eq(sources.id, id), eq(sources.userId, ctx.userId)))
    .returning();

  if (!source) throw new NotFoundError("Source", id);

  auditLog.push({
    id: nanoid(),
    userId: ctx.userId,
    action: "hard_delete",
    resourceType: "source",
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  // TODO: Also delete from vector index, memory graph, R2 objects

  return c.json({ deleted: true, id, hardDelete: true });
});

// GET /audit-log — list audit logs
vaultRouter.get("/audit-log", async (c) => {
  const ctx = getAppContext(c);

  const userLogs = auditLog
    .filter((entry) => entry.userId === ctx.userId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 100);

  return c.json({ auditLog: userLogs });
});

export default vaultRouter;
