import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { connectorAccounts, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import {
  getComposio,
  getToolkitSlug,
  isComposioConfigured,
  isSupportedProvider,
} from "@/server/connectors/composio";

const BodySchema = z.object({
  provider: z.string(),
});

/**
 * POST /api/connectors/connect
 * Begins a Composio OAuth flow for the requested provider.
 * Returns { redirectUrl, connectionId } the frontend opens in a popup.
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const { provider } = parsed.data;
    if (!provider || typeof provider !== "string") {
      return apiError("provider_required", 400);
    }

    if (!isComposioConfigured()) {
      return apiError("Composio is not configured. Please set COMPOSIO_API_KEY environment variable.", 503);
    }

    const composio = getComposio();
    if (!composio) {
      return apiError("Composio is not configured. Please set COMPOSIO_API_KEY environment variable.", 503);
    }

    const toolkitSlug = getToolkitSlug(provider);
    let connectionRequest;
    try {
      connectionRequest = await composio.toolkits.authorize(
        user.id,
        toolkitSlug,
      );
    } catch (err: any) {
      console.error("[connectors/connect] Composio authorization failed:", err);
      const errMsg = err.message || "";
      if (
        errMsg.toLowerCase().includes("invalid api key") ||
        errMsg.toLowerCase().includes("unauthorized") ||
        errMsg.toLowerCase().includes("couldn't fetch toolkit") ||
        err.status === 401 ||
        err.cause?.status === 401 ||
        err.cause?.error?.error?.status === 401
      ) {
        return apiError("Your Composio API Key is invalid or expired. Please verify COMPOSIO_API_KEY environment variable.", 401);
      }
      return apiError(errMsg || "Failed to initiate connection authorization.", 500);
    }

    const externalAccountId = connectionRequest.id;
    const redirectUrl = connectionRequest.redirectUrl ?? null;

    // Upsert by (userId, workspaceId, provider). Drizzle/Neon HTTP doesn't
    // expose ON CONFLICT for our composite key here, so we do select + insert/update.
    const existing = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.userId, user.id),
          eq(connectorAccounts.workspaceId, workspaceId),
          eq(connectorAccounts.provider, provider),
        ),
      )
      .limit(1);

    let row;
    if (existing.length > 0) {
      const [updated] = await db
        .update(connectorAccounts)
        .set({
          status: "disconnected",
          externalAccountId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(connectorAccounts.id, existing[0]!.id))
        .returning();
      row = updated!;
    } else {
      const [created] = await db
        .insert(connectorAccounts)
        .values({
          id: newId("conn"),
          userId: user.id,
          workspaceId,
          provider,
          status: "disconnected",
          externalAccountId,
        })
        .returning();
      row = created!;
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "connector.authorize",
      targetType: "connector_account",
      targetId: row.id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ provider, externalAccountId }),
    });

    return NextResponse.json({
      redirectUrl,
      connectionId: row.id,
      externalAccountId,
    });
  });
}
