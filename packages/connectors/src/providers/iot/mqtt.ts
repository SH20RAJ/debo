import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";

export class MqttConnector implements Connector {
  id = "mqtt";
  name = "MQTT";
  category = "iot" as const;

  async connect(context: ConnectorContext, params: { brokerUrl: string }) {
    return {
      success: true,
      metadata: { brokerUrl: params.brokerUrl, connectedAt: new Date().toISOString() },
    };
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    // MQTT is purely real-time stream-based, sync yields empty array
    return { events: [] };
  }

  async healthCheck(context: ConnectorContext) {
    return { healthy: true };
  }
}
