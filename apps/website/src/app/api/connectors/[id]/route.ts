import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { connectorAccounts, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import { getComposio } from "@/server/connectors/composio";

/**
 * DELETE /api/connectors/:id
 * Disconnect a connector. Removes our row and best-effort deletes the
 * Composio connected account.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;

    const [row] = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.id, id),
          eq(connectorAccounts.userId, user.id),
          eq(connectorAccounts.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!row) return apiError("not_found", 404);

    // Best-effort Composio cleanup
    if (row.externalAccountId) {
      try {
        const composio = getComposio();
        if (composio) {
          await composio.connectedAccounts.delete(row.externalAccountId);
        }
      } catch (err) {
        console.warn("[connectors] composio delete failed", err);
      }
    }

    await db
      .delete(connectorAccounts)
      .where(eq(connectorAccounts.id, row.id));

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "connector.disconnect",
      targetType: "connector_account",
      targetId: row.id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({
        provider: row.provider,
        externalAccountId: row.externalAccountId,
      }),
    });

    return new NextResponse(null, { status: 204 });
  });
}
