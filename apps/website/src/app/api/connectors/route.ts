import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { connectorAccounts } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession, withErrorHandling } from "@/lib/api-helpers";
import {
  SUPPORTED_PROVIDERS,
  getComposio,
  isComposioConfigured,
} from "@/server/connectors/composio";

/**
 * GET /api/connectors
 * Returns the user's connectors. If a provider has no row yet, a placeholder
 * with status "disconnected" is returned so the UI can render the catalog.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const rows = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.userId, user.id),
          eq(connectorAccounts.workspaceId, workspaceId),
        ),
      );

    const composio = getComposio();

    // Verify and sync statuses of disconnected accounts from Composio in real-time
    const updatedRows = await Promise.all(
      rows.map(async (row) => {
        if (
          row.status === "disconnected" &&
          row.externalAccountId &&
          isComposioConfigured() &&
          composio
        ) {
          try {
            const account = await composio.connectedAccounts.get(row.externalAccountId);
            if (account && account.status === "ACTIVE") {
              const [updated] = await db
                .update(connectorAccounts)
                .set({
                  status: "connected",
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(connectorAccounts.id, row.id))
                .returning();
              if (updated) return updated;
            }
          } catch (err) {
            console.warn(
              "[connectors] failed to fetch composio status for",
              row.externalAccountId,
              err,
            );
          }
        }
        return row;
      }),
    );

    const byProvider = new Map(updatedRows.map((r) => [r.provider, r] as const));

    const items = SUPPORTED_PROVIDERS.map((provider) => {
      const row = byProvider.get(provider);
      if (row) {
        return {
          id: row.id,
          provider: row.provider,
          status: row.status,
          lastSyncedAt: row.lastSyncedAt,
          externalAccountId: row.externalAccountId,
        };
      }
      return {
        id: `placeholder_${provider}`,
        provider,
        status: "disconnected" as const,
        lastSyncedAt: null,
        externalAccountId: null,
      };
    });

    // Include any extra providers (e.g. "custom") that aren't in the catalog
    for (const row of updatedRows) {
      if (!SUPPORTED_PROVIDERS.includes(row.provider as (typeof SUPPORTED_PROVIDERS)[number])) {
        items.push({
          id: row.id,
          provider: row.provider,
          status: row.status,
          lastSyncedAt: row.lastSyncedAt,
          externalAccountId: row.externalAccountId,
        });
      }
    }

    return NextResponse.json(items);
  });
}
