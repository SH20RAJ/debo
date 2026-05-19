import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@debo/db";
import { connectorAccounts } from "@debo/db/schema";
import { getAppContext } from "../lib/context";
import { Composio } from "@composio/core";

const app = new Hono();

// Map Debo provider names to Composio toolkit slugs
const PROVIDER_TO_TOOLKIT: Record<string, string> = {
  gmail: "gmail",
  google_calendar: "googlecalendar",
  notion: "notion",
  github: "github",
  slack: "slack",
  drive: "googledrive",
};

const SUPPORTED_PROVIDERS = Object.keys(PROVIDER_TO_TOOLKIT) as Array<
  keyof typeof PROVIDER_TO_TOOLKIT
>;

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const composio = COMPOSIO_API_KEY ? new Composio({ apiKey: COMPOSIO_API_KEY }) : null;

// ─── GET / ─── List available + connected connectors ────────────────────────
app.get("/", async (c) => {
  if (!composio) {
    return c.json({ error: "Composio not configured", connectors: [] }, 503);
  }

  const ctx = getAppContext(c);

  // Fetch user's connected accounts from Composio
  let composioAccounts: any[] = [];
  try {
    const result = await composio.connectedAccounts.list({ userIds: [ctx.userId] });
    composioAccounts = (result as any).items ?? [];
  } catch {
    // If Composio fails, fall back to DB-only view
  }

  // Also pull local DB records for metadata
  const dbRows = await db
    .select()
    .from(connectorAccounts)
    .where(eq(connectorAccounts.userId, ctx.userId))
    .orderBy(desc(connectorAccounts.createdAt));

  const dbByProvider = new Map(dbRows.map((r) => [r.provider, r]));

  const connectors = SUPPORTED_PROVIDERS.map((provider) => {
    const toolkit = PROVIDER_TO_TOOLKIT[provider];
    const composioAccount = composioAccounts.find(
      (a: any) => a.toolkit?.slug === toolkit
    );
    const dbRow = dbByProvider.get(provider as any);

    return {
      provider,
      toolkit,
      status: composioAccount
        ? composioAccount.status === "ACTIVE"
          ? "connected"
          : composioAccount.status.toLowerCase()
        : dbRow?.status ?? "disconnected",
      composioAccountId: composioAccount?.id ?? null,
      localAccountId: dbRow?.id ?? null,
      connectedAt: composioAccount?.createdAt ?? dbRow?.createdAt ?? null,
    };
  });

  return c.json(connectors);
});

// ─── POST /connect ─── Initiate OAuth flow via Composio ─────────────────────
app.post("/connect", async (c) => {
  if (!composio) {
    return c.json({ error: "Composio not configured" }, 503);
  }

  const ctx = getAppContext(c);
  const body = await c.req.json();
  const { provider, callbackUrl } = body;

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider as any)) {
    return c.json(
      { error: `Unsupported provider. Supported: ${SUPPORTED_PROVIDERS.join(", ")}` },
      400
    );
  }

  const toolkit = PROVIDER_TO_TOOLKIT[provider];

  try {
    const session = await composio.create(ctx.userId);
    const connectionRequest = await session.authorize(toolkit, {
      callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/connectors`,
    });

    // Upsert local DB record as pending
    const existing = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.userId, ctx.userId),
          eq(connectorAccounts.provider, provider)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(connectorAccounts)
        .set({
          status: "connected",
          externalAccountId: connectionRequest.id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(connectorAccounts.id, existing[0].id));
    } else {
      await db.insert(connectorAccounts).values({
        id: crypto.randomUUID(),
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
        provider,
        externalAccountId: connectionRequest.id,
        status: "connected",
      });
    }

    return c.json({
      redirectUrl: connectionRequest.redirectUrl,
      connectionId: connectionRequest.id,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to initiate connection" }, 500);
  }
});

// ─── GET /:id/status ─── Check connection status ────────────────────────────
app.get("/:id/status", async (c) => {
  if (!composio) {
    return c.json({ error: "Composio not configured" }, 503);
  }

  const ctx = getAppContext(c);
  const id = c.req.param("id");

  // Try to find by local DB ID first
  const dbRow = await db
    .select()
    .from(connectorAccounts)
    .where(
      and(eq(connectorAccounts.id, id), eq(connectorAccounts.userId, ctx.userId))
    )
    .limit(1);

  const composioAccountId = dbRow[0]?.externalAccountId ?? id;

  try {
    const account = await composio.connectedAccounts.get(composioAccountId);
    const isActive = account.status === "ACTIVE";

    // Sync local DB status
    if (dbRow[0]) {
      const mappedStatus = isActive
        ? "connected"
        : account.status === "EXPIRED"
          ? "expired"
          : account.status === "REVOKED" || account.status === "INACTIVE"
            ? "disconnected"
            : "error";
      await db
        .update(connectorAccounts)
        .set({
          status: mappedStatus,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(connectorAccounts.id, dbRow[0].id));
    }

    return c.json({
      id: (account as any).id,
      status: isActive ? "connected" : (account as any).status?.toLowerCase?.() ?? "unknown",
      toolkit: (account as any).toolkit?.slug,
      createdAt: (account as any).createdAt,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to check status" }, 500);
  }
});

// ─── DELETE /:id ─── Disconnect an account ──────────────────────────────────
app.delete("/:id", async (c) => {
  if (!composio) {
    return c.json({ error: "Composio not configured" }, 503);
  }

  const ctx = getAppContext(c);
  const id = c.req.param("id");

  // Find by local DB ID
  const dbRow = await db
    .select()
    .from(connectorAccounts)
    .where(
      and(eq(connectorAccounts.id, id), eq(connectorAccounts.userId, ctx.userId))
    )
    .limit(1);

  if (!dbRow[0]) {
    return c.json({ error: "Not found" }, 404);
  }

  const composioAccountId = dbRow[0].externalAccountId;

  try {
    if (composioAccountId) {
      await composio.connectedAccounts.delete(composioAccountId);
    }
  } catch {
    // If Composio delete fails, still mark local as disconnected
  }

  await db
    .update(connectorAccounts)
    .set({ status: "disconnected", updatedAt: new Date().toISOString() })
    .where(eq(connectorAccounts.id, dbRow[0].id));

  return c.json({ success: true });
});

export default app;
