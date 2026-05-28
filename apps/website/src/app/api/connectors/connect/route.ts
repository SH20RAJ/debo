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
    if (!isSupportedProvider(provider)) {
      return apiError("unsupported_provider", 400, { provider });
    }

    if (!isComposioConfigured()) {
      return apiError("service_not_configured", 503, { service: "composio" });
    }

    const composio = getComposio();
    if (!composio) {
      return apiError("service_not_configured", 503, { service: "composio" });
    }

    const toolkitSlug = getToolkitSlug(provider);
    const connectionRequest = await composio.toolkits.authorize(
      user.id,
      toolkitSlug,
    );

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
