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

    const byProvider = new Map(updatedRows.map((r) => [r.provider.toLowerCase(), r] as const));

    // Fallback catalog of connectors with real SVG logos
    const FALLBACK_CONNECTORS = [
      { provider: "gmail", name: "Gmail", description: "Sync your emails to search conversations, summaries, and action items.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg", color: "#EA4335", category: "Communication", permission: "Read-only access to emails and metadata" },
      { provider: "google_calendar", name: "Google Calendar", description: "Sync your schedule to cross-reference meetings, events, and timelines.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecalendar.svg", color: "#4285F4", category: "Productivity", permission: "Read-only access to calendar events" },
      { provider: "notion", name: "Notion", description: "Import pages, databases, and workspace notes into your memory graph.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg", color: "#000000", category: "Knowledge & Notes", permission: "Read and import pages shared with the integration" },
      { provider: "github", name: "GitHub", description: "Sync repositories, pull requests, issues, and commits.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg", color: "#24292e", category: "Development", permission: "Read access to repositories, code, and issues" },
      { provider: "slack", name: "Slack", description: "Index channels and direct messages for conversational context.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg", color: "#4A154B", category: "Communication", permission: "Read public channels and direct messages" },
      { provider: "drive", name: "Google Drive", description: "Sync PDFs, text documents, spreadsheets, and presentations.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googledrive.svg", color: "#34A853", category: "Knowledge & Notes", permission: "Read-only access to select files and folders" },
      { provider: "jira", name: "Jira", description: "Sync sprint tickets, tasks, boards, and project timelines.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg", color: "#0052CC", category: "Development", permission: "Read tasks and ticket details" },
      { provider: "hubspot", name: "HubSpot", description: "Sync customer deals, contacts, pipeline notes, and CRM emails.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg", color: "#FF7A59", category: "Business", permission: "Read CRM deals and contacts" },
      { provider: "discord", name: "Discord", description: "Sync guild channels, messages, and voice chat transcripts.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/discord.svg", color: "#5865F2", category: "Communication", permission: "Read guild text messages" },
      { provider: "trello", name: "Trello", description: "Sync project boards, cards, and team check-ins.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg", color: "#0079BF", category: "Productivity", permission: "Read boards and card titles" },
      { provider: "zoom", name: "Zoom", description: "Sync video transcripts, chats, recordings, and schedules.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zoom.svg", color: "#2D8CFF", category: "Communication", permission: "Read meeting audio transcripts" },
      { provider: "salesforce", name: "Salesforce", description: "Sync enterprise client accounts, pipeline history, and CRM notes.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg", color: "#00A1E0", category: "Business", permission: "Read account and lead history" }
    ];

    let composioItems: any[] = [];
    if (isComposioConfigured()) {
      try {
        const response = await fetch("https://backend.composio.dev/api/v3.1/toolkits?limit=100&managed_by=composio", {
          headers: {
            "x-api-key": process.env.COMPOSIO_API_KEY || "",
          },
        });
        if (response.ok) {
          const data = await response.json();
          composioItems = data.items || [];
        }
      } catch (err) {
        console.warn("[connectors] Failed to fetch toolkits dynamically from Composio API:", err);
      }
    }

    let items = [];
    if (composioItems.length > 0) {
      items = composioItems.map((item) => {
        const slug = item.slug || "";
        const row = byProvider.get(slug.toLowerCase());
        return {
          id: row ? row.id : `placeholder_${slug}`,
          provider: slug,
          name: item.name || slug,
          description: item.description || `Integrate ${item.name || slug} with your Debo memory.`,
          icon: item.logo || `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${slug.toLowerCase()}.svg`,
          color: item.color || "#6b7280",
          category: item.category || "Apps",
          permission: "Access to sync records and trigger actions",
          status: row ? (row.status === "disconnected" ? "disconnected" : row.status) : "disconnected",
          lastSyncedAt: row ? row.lastSyncedAt : null,
          externalAccountId: row ? row.externalAccountId : null,
        };
      });
    } else {
      // Fallback to static catalog with real SVG logos
      items = FALLBACK_CONNECTORS.map((c) => {
        const row = byProvider.get(c.provider.toLowerCase());
        return {
          id: row ? row.id : `placeholder_${c.provider}`,
          provider: c.provider,
          name: c.name,
          description: c.description,
          icon: c.icon,
          color: c.color,
          category: c.category,
          permission: c.permission,
          status: row ? (row.status === "disconnected" ? "disconnected" : row.status) : "disconnected",
          lastSyncedAt: row ? row.lastSyncedAt : null,
          externalAccountId: row ? row.externalAccountId : null,
        };
      });
    }

    // Include any extra database rows that aren't represented in the fetched list
    const mappedProviders = new Set(items.map(i => i.provider.toLowerCase()));
    for (const row of updatedRows) {
      if (!mappedProviders.has(row.provider.toLowerCase())) {
        items.push({
          id: row.id,
          provider: row.provider,
          name: row.provider.charAt(0).toUpperCase() + row.provider.slice(1),
          description: "Connected memory sync account.",
          icon: `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${row.provider.toLowerCase()}.svg`,
          color: "#6b7280",
          category: "Other",
          permission: "Access to sync records",
          status: row.status,
          lastSyncedAt: row.lastSyncedAt,
          externalAccountId: row.externalAccountId,
        });
      }
    }

    return NextResponse.json(items);
  });
}
