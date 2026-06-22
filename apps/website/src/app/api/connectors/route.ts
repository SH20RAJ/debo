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
      // 1. Productivity
      { provider: "gmail", name: "Gmail", description: "Sync your emails to search conversations, summaries, and action items.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg", color: "#EA4335", category: "Productivity", permission: "Read-only access to emails and metadata" },
      { provider: "google_calendar", name: "Google Calendar", description: "Sync your schedule to cross-reference meetings, events, and timelines.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecalendar.svg", color: "#4285F4", category: "Productivity", permission: "Read-only access to calendar events" },
      { provider: "notion", name: "Notion", description: "Import pages, databases, and workspace notes into your memory graph.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg", color: "#000000", category: "Productivity", permission: "Read and import pages shared with the integration" },
      { provider: "github", name: "GitHub", description: "Sync repositories, pull requests, issues, and commits.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg", color: "#24292e", category: "Productivity", permission: "Read access to repositories, code, and issues" },
      { provider: "slack", name: "Slack", description: "Index channels and direct messages for conversational context.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg", color: "#4A154B", category: "Productivity", permission: "Read public channels and direct messages" },
      { provider: "drive", name: "Google Drive", description: "Sync PDFs, text documents, spreadsheets, and presentations.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googledrive.svg", color: "#34A853", category: "Productivity", permission: "Read-only access to select files and folders" },
      { provider: "discord", name: "Discord", description: "Sync guild channels, messages, and voice chat transcripts.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/discord.svg", color: "#5865F2", category: "Productivity", permission: "Read guild text messages" },
      { provider: "telegram", name: "Telegram", description: "Sync chats, channels, files, and voice notes into memory.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/telegram.svg", color: "#26A69A", category: "Productivity", permission: "Read chats and media files" },

      // 2. Health
      { provider: "fitbit", name: "Fitbit", description: "Sync sleep durations, heart rate logs, stress metrics, and workouts.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/fitbit.svg", color: "#00B0B9", category: "Health", permission: "Read heart rate, sleep, activity data" },
      { provider: "garmin", name: "Garmin", description: "Sync biometric records, body battery, sleep scores, and activity.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/garmin.svg", color: "#000000", category: "Health", permission: "Read workouts, sleep, vitals" },
      { provider: "healthconnect", name: "Health Connect", description: "Import health telemetry directly from your Android devices.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/android.svg", color: "#3DDC84", category: "Health", permission: "Read local health datastores" },

      // 3. Smart Home & IoT
      { provider: "homeassistant", name: "Home Assistant", description: "Control and monitor your smart home devices (lights, switches, climate, locks).", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/homeassistant.svg", color: "#41BDF5", category: "Smart Home", permission: "Read states and call device control services" },
      { provider: "smartthings", name: "SmartThings", description: "Sync Samsung SmartThings appliances, devices, and rooms.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/smartthings.svg", color: "#15BFFF", category: "Smart Home", permission: "Access device lists and trigger controls" },
      { provider: "tuya", name: "Tuya Smart", description: "Sync smart plugs, switches, and lighting via Tuya IoT platform.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tuya.svg", color: "#FF5500", category: "Smart Home", permission: "Query device configurations and set states" },

      // 4. IoT Protocols
      { provider: "mqtt", name: "MQTT Broker", description: "Subscribe to custom telemetry topics and parse IoT data payloads.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mqtt.svg", color: "#660066", category: "IoT", permission: "Subscribe to topics and publish control commands" },
      { provider: "zigbee", name: "Zigbee", description: "Monitor Zigbee sensor meshes and controllers directly.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zigbee.svg", color: "#E6002A", category: "IoT", permission: "Read Zigbee sensor packets" },

      // 5. Security
      { provider: "onvif", name: "ONVIF Cameras", description: "Scan IP security cameras, retrieve snapshots, and capture motion alerts.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/onf.svg", color: "#000000", category: "Security", permission: "Read streams and trigger event webhooks" },
      { provider: "ring", name: "Ring", description: "Log doorbell ring events, motion alerts, and snapshot camera feeds.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ring.svg", color: "#00AEEF", category: "Security", permission: "Receive doorbell alerts and access media" },

      // 6. Location
      { provider: "googlemaps", name: "Google Maps Timeline", description: "Import location history to index visits, travels, and city stays.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlemaps.svg", color: "#4285F4", category: "Location", permission: "Read location coordinates history" },

      // 7. Vehicles
      { provider: "tesla", name: "Tesla Vehicle", description: "Monitor battery levels, locks, climate, and charging status.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tesla.svg", color: "#CC0000", category: "Vehicles", permission: "Read telemetry and execute locks/climate commands" },
      { provider: "jira", name: "Jira", description: "Sync sprint tickets, tasks, boards, and project timelines.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg", color: "#0052CC", category: "Productivity", permission: "Read tasks and ticket details" },
      { provider: "hubspot", name: "HubSpot", description: "Sync customer deals, contacts, pipeline notes, and CRM emails.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg", color: "#FF7A59", category: "Productivity", permission: "Read CRM deals and contacts" },
      { provider: "trello", name: "Trello", description: "Sync project boards, cards, and team check-ins.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg", color: "#0079BF", category: "Productivity", permission: "Read boards and card titles" },
      { provider: "zoom", name: "Zoom", description: "Sync video transcripts, chats, recordings, and schedules.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zoom.svg", color: "#2D8CFF", category: "Productivity", permission: "Read meeting audio transcripts" },
      { provider: "salesforce", name: "Salesforce", description: "Sync enterprise client accounts, pipeline history, and CRM notes.", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg", color: "#00A1E0", category: "Productivity", permission: "Read account and lead history" }
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
          metadataJson: row ? row.metadataJson : null,
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
          metadataJson: row ? row.metadataJson : null,
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
          metadataJson: row.metadataJson,
        });
      }
    }

    return NextResponse.json(items);
  });
}
