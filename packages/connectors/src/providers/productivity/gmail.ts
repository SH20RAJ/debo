import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";

export class GmailConnector implements Connector {
  id = "gmail";
  name = "Gmail";
  category = "productivity" as const;

  async connect(context: ConnectorContext, params: { token: string }) {
    return {
      success: true,
      metadata: { connectedAt: new Date().toISOString() },
    };
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    // Sync logic mimicking message queries from Gmail API
    const events: Omit<NormalizedEvent, "id" | "userId">[] = [
      {
        source: "gmail",
        category: "productivity",
        eventType: "gmail.email_received",
        timestamp: new Date(),
        summary: "Email received: Welcome to Debo Monorepo Team Check-in",
        metadata: {
          subject: "Welcome to Debo Monorepo Team Check-in",
          sender: "team@debo.life",
        },
        rawPayload: { id: "msg_123", subject: "Welcome to Debo Monorepo Team Check-in" },
      }
    ];
    return { events };
  }

  async healthCheck(context: ConnectorContext) {
    return { healthy: true };
  }
}
