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
import { parseAutomationInstruction } from "@/server/connectors/automations/parser";

const DEFAULT_SIMULATED_DEVICES = {
  "light.living_room": { entity_id: "light.living_room", name: "Living Room Light", state: "off", brightness: 128 },
  "switch.kitchen_fan": { entity_id: "switch.kitchen_fan", name: "Kitchen Fan", state: "off" },
  "lock.front_door": { entity_id: "lock.front_door", name: "Front Door Lock", state: "locked" },
  "climate.thermostat": { entity_id: "climate.thermostat", name: "Thermostat", state: "heat", temperature: 22 }
};

const ConnectSchema = z.object({
  action: z.string().optional().default("connect"),
  // For action: "connect"
  url: z.string().optional(),
  token: z.string().optional(),
  simulated: z.boolean().optional(),
  // For action: "add_automation"
  instruction: z.string().optional(),
  // For action: "delete_automation"
  automationId: z.string().optional(),
});

/**
 * POST /api/connectors/homeassistant
 * Handles connection setup, creating automations, deleting automations, and running the scheduler.
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = ConnectSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const { action, url, token, simulated, instruction, automationId } = parsed.data;

    // ─── ACTION: ADD AUTOMATION ───────────────────────────────────────────────
    if (action === "add_automation") {
      if (!instruction) return apiError("instruction_required", 400);

      const parsedAuto = await parseAutomationInstruction(instruction);
      if (!parsedAuto) {
        return apiError("Could not parse automation rule. Make sure it specifies a device and a schedule/trigger keyword.", 422);
      }

      const [account] = await db
        .select()
        .from(connectorAccounts)
        .where(
          and(
            eq(connectorAccounts.userId, user.id),
            eq(connectorAccounts.workspaceId, workspaceId),
            eq(connectorAccounts.provider, "homeassistant"),
            eq(connectorAccounts.status, "connected")
          )
        )
        .limit(1);

      if (!account) return apiError("connector_not_connected", 404);

      const metadata = JSON.parse(account.metadataJson || "{}");
      const automations = metadata.automations || [];
      automations.push(parsedAuto);
      metadata.automations = automations;

      await db
        .update(connectorAccounts)
        .set({
          metadataJson: JSON.stringify(metadata),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(connectorAccounts.id, account.id));

      return NextResponse.json({ success: true, automation: parsedAuto });
    }

    // ─── ACTION: DELETE AUTOMATION ────────────────────────────────────────────
    if (action === "delete_automation") {
      if (!automationId) return apiError("automation_id_required", 400);

      const [account] = await db
        .select()
        .from(connectorAccounts)
        .where(
          and(
            eq(connectorAccounts.userId, user.id),
            eq(connectorAccounts.workspaceId, workspaceId),
            eq(connectorAccounts.provider, "homeassistant"),
            eq(connectorAccounts.status, "connected")
          )
        )
        .limit(1);

      if (!account) return apiError("connector_not_connected", 404);

      const metadata = JSON.parse(account.metadataJson || "{}");
      const automations = metadata.automations || [];
      metadata.automations = automations.filter((a: any) => a.id !== automationId);

      await db
        .update(connectorAccounts)
        .set({
          metadataJson: JSON.stringify(metadata),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(connectorAccounts.id, account.id));

      return NextResponse.json({ success: true });
    }

    // ─── ACTION: RUN SCHEDULER ───────────────────────────────────────────────
    if (action === "run_scheduler") {
      const [account] = await db
        .select()
        .from(connectorAccounts)
        .where(
          and(
            eq(connectorAccounts.userId, user.id),
            eq(connectorAccounts.workspaceId, workspaceId),
            eq(connectorAccounts.provider, "homeassistant"),
            eq(connectorAccounts.status, "connected")
          )
        )
        .limit(1);

      if (!account) return NextResponse.json({ success: true, triggered: [] });

      const metadata = JSON.parse(account.metadataJson || "{}");
      const automations = metadata.automations || [];
      const devices = metadata.devices || {};
      
      const now = new Date();
      // Format current time in local/server HH:MM format
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${hour}:${minute}`;
      const dateStr = now.toISOString().split("T")[0];

      const triggered: any[] = [];

      for (const auto of automations) {
        if (auto.type === "schedule" && auto.active && auto.time === timeStr && auto.lastExecutedDate !== dateStr) {
          const device = devices[auto.entityId];
          if (device) {
            // Apply action
            device.state = auto.state;
            auto.lastExecutedDate = dateStr;
            triggered.push(auto);

            // If live connection, execute service call
            if (!metadata.simulated) {
              const [domain] = auto.entityId.split(".");
              let service = "";
              const body = { entity_id: auto.entityId };
              if (domain === "light" || domain === "switch") {
                service = auto.state === "on" ? "turn_on" : "turn_off";
              } else if (domain === "lock") {
                service = auto.state === "lock" || auto.state === "locked" ? "lock" : "unlock";
              }
              try {
                await fetch(`${metadata.url}/api/services/${domain}/${service}`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${metadata.token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(body),
                });
              } catch (err) {
                console.error("[scheduler] Live Home Assistant trigger failed:", err);
              }
            }
          }
        }
      }

      if (triggered.length > 0) {
        metadata.devices = devices;
        metadata.automations = automations;

        await db
          .update(connectorAccounts)
          .set({
            metadataJson: JSON.stringify(metadata),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(connectorAccounts.id, account.id));
      }

      return NextResponse.json({ success: true, triggered });
    }

    // ─── ACTION: CONNECT (FALLBACK) ──────────────────────────────────────────
    const isSimulated = simulated ?? true;
    let deviceStates = { ...DEFAULT_SIMULATED_DEVICES };
    let finalUrl = "";
    let finalToken = "";

    if (!isSimulated) {
      if (!url) return apiError("url_required_for_real_mode", 400);
      if (!token) return apiError("token_required_for_real_mode", 400);

      finalUrl = url.trim().replace(/\/+$/, "");
      finalToken = token.trim();

      // Test connection
      try {
        const testRes = await fetch(`${finalUrl}/api/`, {
          headers: {
            Authorization: `Bearer ${finalToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!testRes.ok) {
          return apiError(`Failed to connect to Home Assistant API. Status: ${testRes.status}`, 400);
        }

        const statesRes = await fetch(`${finalUrl}/api/states`, {
          headers: {
            Authorization: `Bearer ${finalToken}`,
            "Content-Type": "application/json",
          },
        });

        if (statesRes.ok) {
          const rawStates = await statesRes.json();
          if (Array.isArray(rawStates)) {
            const haDevices: Record<string, any> = {};
            for (const item of rawStates) {
              const entityId = item.entity_id;
              if (
                entityId.startsWith("light.") ||
                entityId.startsWith("switch.") ||
                entityId.startsWith("lock.") ||
                entityId.startsWith("climate.")
              ) {
                haDevices[entityId] = {
                  entity_id: entityId,
                  name: item.attributes?.friendly_name || entityId,
                  state: item.state,
                  brightness: item.attributes?.brightness ?? undefined,
                  temperature: item.attributes?.temperature ?? undefined,
                };
              }
            }
            if (Object.keys(haDevices).length > 0) {
              deviceStates = { ...DEFAULT_SIMULATED_DEVICES, ...haDevices };
            }
          }
        }
      } catch (err: any) {
        return apiError(`Home Assistant connection error: ${err.message || err}`, 400);
      }
    }

    const metadata = {
      url: finalUrl,
      token: finalToken,
      simulated: isSimulated,
      devices: deviceStates,
      automations: [],
    };

    const existing = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.userId, user.id),
          eq(connectorAccounts.workspaceId, workspaceId),
          eq(connectorAccounts.provider, "homeassistant")
        )
      )
      .limit(1);

    let row;
    if (existing.length > 0) {
      const [updated] = await db
        .update(connectorAccounts)
        .set({
          status: "connected",
          metadataJson: JSON.stringify(metadata),
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
          provider: "homeassistant",
          status: "connected",
          metadataJson: JSON.stringify(metadata),
        })
        .returning();
      row = created!;
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "connector.connect_homeassistant",
      targetType: "connector_account",
      targetId: row.id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ provider: "homeassistant", simulated: isSimulated }),
    });

    return NextResponse.json({
      success: true,
      connectorId: row.id,
      simulated: isSimulated,
    });
  });
}

const ControlSchema = z.object({
  entityId: z.string(),
  state: z.string(),
  brightness: z.number().min(0).max(255).optional(),
  temperature: z.number().optional(),
});

/**
 * PATCH /api/connectors/homeassistant - Control an IoT device directly
 */
export async function PATCH(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = ControlSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const { entityId, state, brightness, temperature } = parsed.data;

    const [account] = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.userId, user.id),
          eq(connectorAccounts.workspaceId, workspaceId),
          eq(connectorAccounts.provider, "homeassistant"),
          eq(connectorAccounts.status, "connected")
        )
      )
      .limit(1);

    if (!account) return apiError("connector_not_connected", 404);

    const metadata = JSON.parse(account.metadataJson || "{}");
    const { url, token, simulated, devices = {} } = metadata;

    const device = devices[entityId];
    if (!device) return apiError("device_not_found", 404);

    const updatedDevice = { ...device };
    if (entityId.startsWith("lock.")) {
      updatedDevice.state = state === "lock" || state === "locked" ? "locked" : "unlocked";
    } else {
      updatedDevice.state = state;
    }

    if (brightness !== undefined) updatedDevice.brightness = brightness;
    if (temperature !== undefined) updatedDevice.temperature = temperature;

    if (!simulated) {
      const [domain] = entityId.split(".");
      let service = "";
      const body: Record<string, any> = { entity_id: entityId };

      if (domain === "light" || domain === "switch") {
        service = state === "on" ? "turn_on" : "turn_off";
        if (domain === "light" && brightness !== undefined) {
          body.brightness = brightness;
        }
      } else if (domain === "lock") {
        service = state === "lock" || state === "locked" ? "lock" : "unlock";
      } else if (domain === "climate") {
        service = "set_temperature";
        if (temperature !== undefined) {
          body.temperature = temperature;
        }
      }

      try {
        await fetch(`${url}/api/services/${domain}/${service}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.error("[homeassistant/control] HA request failed:", err);
      }
    }

    metadata.devices = {
      ...devices,
      [entityId]: updatedDevice,
    };

    await db
      .update(connectorAccounts)
      .set({
        metadataJson: JSON.stringify(metadata),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(connectorAccounts.id, account.id));

    return NextResponse.json({
      success: true,
      device: updatedDevice,
      allDevices: metadata.devices,
    });
  });
}
