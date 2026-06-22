import { Connector, ConnectorContext, SyncOptions } from "../../base";
import { NormalizedEvent } from "../../types";

export class NotionConnector implements Connector {
  id = "notion";
  name = "Notion";
  category = "productivity" as const;

  async connect(context: ConnectorContext, params: { token: string }) {
    return {
      success: true,
      metadata: { connectedAt: new Date().toISOString() },
    };
  }

  async disconnect(context: ConnectorContext) {}

  async sync(context: ConnectorContext, options?: SyncOptions) {
    const events: Omit<NormalizedEvent, "id" | "userId">[] = [
      {
        source: "notion",
        category: "productivity",
        eventType: "notion.page_created",
        timestamp: new Date(),
        summary: "Notion page created: Q3 Strategic Roadmap Draft",
        metadata: {
          pageId: "notion_page_567",
          title: "Q3 Strategic Roadmap Draft",
        },
        rawPayload: { id: "notion_page_567", title: "Q3 Strategic Roadmap Draft" },
      }
    ];
    return { events };
  }

  async healthCheck(context: ConnectorContext) {
    return { healthy: true };
  }
}
