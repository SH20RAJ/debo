"use server";

import { db } from "@/db";
import { connectors, connectorEvents, journals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export type ConnectorType =
  | "slack"
  | "discord"
  | "notion"
  | "linear"
  | "gmail"
  | "calendar"
  | "github"
  | "trello"
  | "asana"
  | "jira"
  | "custom";

export type ConnectorConfig = {
  name: string;
  connectorType: ConnectorType;
  apiKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  baseUrl?: string;
  metadata?: Record<string, unknown>;
};

export async function createConnector(userId: string, config: ConnectorConfig) {
  try {
    const id = uuid();

    await db.insert(connectors).values({
      id,
      userId,
      name: config.name,
      connectorType: config.connectorType,
      apiKey: config.apiKey,
      webhookUrl: config.webhookUrl,
      webhookSecret: config.webhookSecret,
      baseUrl: config.baseUrl,
      metadata: config.metadata ? JSON.stringify(config.metadata) : null,
      isEnabled: true,
      syncStatus: "idle",
    });

    return { success: true, data: { id, name: config.name, type: config.connectorType } };
  } catch (error) {
    console.error("Failed to create connector:", error);
    return { success: false, error: "Failed to create connector" };
  }
}

export async function listConnectors(userId: string) {
  try {
    const rows = await db.query.connectors.findMany({
      where: eq(connectors.userId, userId),
      orderBy: [desc(connectors.createdAt)],
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      connectorType: row.connectorType,
      isEnabled: row.isEnabled,
      lastSyncAt: row.lastSyncAt,
      syncStatus: row.syncStatus,
      webhookUrl: row.webhookUrl,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error("Failed to list connectors:", error);
    return [];
  }
}

export async function getConnector(userId: string, connectorId: string) {
  try {
    const row = await db.query.connectors.findFirst({
      where: and(eq(connectors.id, connectorId), eq(connectors.userId, userId)),
    });

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      connectorType: row.connectorType,
      isEnabled: row.isEnabled,
      lastSyncAt: row.lastSyncAt,
      syncStatus: row.syncStatus,
      webhookUrl: row.webhookUrl,
      baseUrl: row.baseUrl,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: row.createdAt,
    };
  } catch (error) {
    console.error("Failed to get connector:", error);
    return null;
  }
}

export async function updateConnector(userId: string, connectorId: string, updates: Partial<ConnectorConfig>) {
  try {
    const existing = await db.query.connectors.findFirst({
      where: and(eq(connectors.id, connectorId), eq(connectors.userId, userId)),
    });

    if (!existing) return { success: false, error: "Connector not found" };

    await db.update(connectors)
      .set({
        name: updates.name ?? existing.name,
        connectorType: updates.connectorType ?? existing.connectorType,
        apiKey: updates.apiKey ?? existing.apiKey,
        webhookUrl: updates.webhookUrl ?? existing.webhookUrl,
        webhookSecret: updates.webhookSecret ?? existing.webhookSecret,
        baseUrl: updates.baseUrl ?? existing.baseUrl,
        metadata: updates.metadata ? JSON.stringify(updates.metadata) : existing.metadata,
        updatedAt: new Date(),
      })
      .where(and(eq(connectors.id, connectorId), eq(connectors.userId, userId)));

    return { success: true, data: { id: connectorId } };
  } catch (error) {
    console.error("Failed to update connector:", error);
    return { success: false, error: "Failed to update connector" };
  }
}

export async function deleteConnector(userId: string, connectorId: string) {
  try {
    const existing = await db.query.connectors.findFirst({
      where: and(eq(connectors.id, connectorId), eq(connectors.userId, userId)),
    });

    if (!existing) return { success: false, error: "Connector not found" };

    await db.delete(connectors).where(eq(connectors.id, connectorId));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete connector:", error);
    return { success: false, error: "Failed to delete connector" };
  }
}

export async function syncConnector(userId: string, connectorId: string) {
  try {
    await db.update(connectors)
      .set({ syncStatus: "syncing", updatedAt: new Date() })
      .where(and(eq(connectors.id, connectorId), eq(connectors.userId, userId)));

    // TODO: Implement actual sync logic per connector type
    // This is a placeholder that marks sync as success after a delay

    await db.update(connectors)
      .set({
        syncStatus: "success",
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(connectors.id, connectorId), eq(connectors.userId, userId)));

    return { success: true, lastSyncAt: new Date().toISOString() };
  } catch (error) {
    await db.update(connectors)
      .set({ syncStatus: "error", updatedAt: new Date() })
      .where(and(eq(connectors.id, connectorId), eq(connectors.userId, userId)));

    return { success: false, error: "Sync failed" };
  }
}

// Event handling
export async function processIncomingEvent(
  userId: string,
  connectorId: string,
  event: {
    eventType: string;
    content: string;
    sourceId?: string;
    sourceUrl?: string;
    authorName?: string;
    channelName?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    const id = uuid();

    await db.insert(connectorEvents).values({
      id,
      userId,
      connectorId,
      eventType: event.eventType,
      content: event.content,
      sourceId: event.sourceId,
      sourceUrl: event.sourceUrl,
      authorName: event.authorName,
      channelName: event.channelName,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      createdAt: new Date(),
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Failed to process event:", error);
    return { success: false, error: "Failed to process event" };
  }
}

export async function listConnectorEvents(userId: string, connectorId: string, limit = 20) {
  try {
    const rows = await db.query.connectorEvents.findMany({
      where: and(eq(connectorEvents.userId, userId), eq(connectorEvents.connectorId, connectorId)),
      orderBy: [desc(connectorEvents.createdAt)],
      limit,
    });

    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType,
      content: row.content,
      sourceId: row.sourceId,
      sourceUrl: row.sourceUrl,
      authorName: row.authorName,
      channelName: row.channelName,
      processedAt: row.processedAt,
      journalId: row.journalId,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error("Failed to list events:", error);
    return [];
  }
}

export async function getConnectorHealth(userId: string) {
  try {
    const rows = await db.query.connectors.findMany({
      where: eq(connectors.userId, userId),
    });

    return {
      total: rows.length,
      active: rows.filter(r => r.isEnabled).length,
      error: rows.filter(r => r.syncStatus === "error").length,
      connectors: rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.connectorType,
        status: r.syncStatus,
        isEnabled: r.isEnabled,
        lastSyncAt: r.lastSyncAt,
      })),
    };
  } catch (error) {
    console.error("Failed to get health:", error);
    return { total: 0, active: 0, error: 0, connectors: [] };
  }
}
