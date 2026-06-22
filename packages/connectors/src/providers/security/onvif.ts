import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";

export class OnvifConnector implements Connector {
  id = "onvif";
  name = "ONVIF CCTV";
  category = "security" as const;

  async connect(context: ConnectorContext, params: { ip: string }) {
    return {
      success: true,
      metadata: { ip: params.ip, connectedAt: new Date().toISOString() },
    };
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    return { events: [] };
  }

  async healthCheck(context: ConnectorContext) {
    return { healthy: true };
  }
}
