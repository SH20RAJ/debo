import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";

export class HomeAssistantConnector implements Connector {
  id = "homeassistant";
  name = "Home Assistant";
  category = "smart_home" as const;

  async connect(context: ConnectorContext, params: { url: string; token: string }) {
    const cleanUrl = params.url.trim().replace(/\/+$/, "");
    try {
      const res = await fetch(`${cleanUrl}/api/`, {
        headers: { Authorization: `Bearer ${params.token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      return {
        success: true,
        metadata: { url: cleanUrl, token: params.token, connectedAt: new Date().toISOString() },
      };
    } catch (err: any) {
      throw new Error(`Failed to verify Home Assistant: ${err.message}`);
    }
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    const { url, token, simulated } = context.credentials;
    if (simulated) {
      return { events: [] };
    }

    try {
      const res = await fetch(`${url}/api/states`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to pull Home Assistant states");
      
      const states = await res.json();
      const events: Omit<NormalizedEvent, "id" | "userId">[] = [];

      for (const stateObj of states) {
        const entityId = stateObj.entity_id;
        if (entityId.startsWith("sensor.") || entityId.startsWith("binary_sensor.")) {
          events.push({
            source: "homeassistant",
            category: "smart_home",
            eventType: "homeassistant.state_changed",
            timestamp: new Date(stateObj.last_updated),
            summary: `${stateObj.attributes?.friendly_name || entityId} reports state "${stateObj.state}"`,
            metadata: {
              entityId,
              state: stateObj.state,
              attributes: stateObj.attributes,
            },
            rawPayload: stateObj,
          });
        }
      }
      return { events };
    } catch (err) {
      console.error("[HomeAssistantConnector.sync] failed:", err);
      return { events: [] };
    }
  }

  async healthCheck(context: ConnectorContext) {
    if (context.credentials.simulated) {
      return { healthy: true };
    }
    try {
      const cleanUrl = context.credentials.url;
      const res = await fetch(`${cleanUrl}/api/`, {
        headers: { Authorization: `Bearer ${context.credentials.token}` },
      });
      return { healthy: res.ok };
    } catch (err: any) {
      return { healthy: false, error: err.message };
    }
  }
}
