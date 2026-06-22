import { NormalizedEvent } from "./types";

export interface SyncOptions {
  force?: boolean;
  incremental?: boolean;
}

export interface ConnectorContext {
  userId: string;
  connectorAccountId: string;
  credentials: Record<string, any>;
  metadata: Record<string, any>;
  updateMetadata: (meta: Record<string, any>) => Promise<void>;
}

export interface Connector {
  id: string; // e.g. "homeassistant", "gmail", "fitbit"
  name: string;
  category: "productivity" | "health" | "smart_home" | "iot" | "security" | "location" | "vehicles";

  connect(context: ConnectorContext, params: Record<string, any>): Promise<{ success: boolean; metadata?: Record<string, any> }>;
  disconnect(context: ConnectorContext): Promise<void>;
  sync(context: ConnectorContext, options?: SyncOptions): Promise<{ events: Omit<NormalizedEvent, "id" | "userId">[] }>;
  webhook?(context: ConnectorContext, req: Request): Promise<{ events: Omit<NormalizedEvent, "id" | "userId">[]; response?: Response }>;
  healthCheck(context: ConnectorContext): Promise<{ healthy: boolean; error?: string }>;
}
