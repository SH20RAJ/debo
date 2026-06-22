import { db } from "@debo/db";
import { normalizedEvents, iotEntities } from "@debo/db/schema";
import { and, eq, gte, lte, desc, ilike, or } from "drizzle-orm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * getEventsTool:
 * Queries the normalized_events timeline database table with optional filters.
 */
export const getEventsTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const { category, source, startDate, endDate, limit = 50 } = input;
      const conditions = [
        eq(normalizedEvents.userId, userId),
        eq(normalizedEvents.workspaceId, workspaceId),
      ];

      if (category) {
        conditions.push(eq(normalizedEvents.category, category));
      }
      if (source) {
        conditions.push(eq(normalizedEvents.source, source));
      }
      if (startDate) {
        conditions.push(gte(normalizedEvents.timestamp, startDate));
      }
      if (endDate) {
        conditions.push(lte(normalizedEvents.timestamp, endDate));
      }

      const results = await db
        .select()
        .from(normalizedEvents)
        .where(and(...conditions))
        .orderBy(desc(normalizedEvents.timestamp))
        .limit(limit);

      return JSON.stringify(results);
    } catch (err: any) {
      return `Error retrieving events: ${err.message || err}`;
    }
  },
  {
    name: "get_events",
    description: "Query normalized timeline life events with optional filters (category, source, date range). Categories include 'Productivity', 'Health', 'Smart Home', 'IoT', 'Security', 'Location', 'Vehicles'.",
    schema: z.object({
      category: z.string().optional().describe("Filter by category, e.g. 'Productivity', 'Health', 'Smart Home', 'Security', 'Location', 'Vehicles'"),
      source: z.string().optional().describe("Filter by source, e.g. 'gmail', 'fitbit', 'homeassistant', 'mqtt', 'tesla'"),
      startDate: z.string().optional().describe("Start date filter in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)"),
      endDate: z.string().optional().describe("End date filter in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)"),
      limit: z.number().optional().describe("Maximum number of events to return (default 50, max 100)"),
    }),
  }
);

/**
 * getHealthEventsTool:
 * Specifically fetches health biometric events (Fitbit, Garmin, Apple Health).
 */
export const getHealthEventsTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const { startDate, endDate, limit = 50 } = input;
      const conditions = [
        eq(normalizedEvents.userId, userId),
        eq(normalizedEvents.workspaceId, workspaceId),
        eq(normalizedEvents.category, "Health"),
      ];

      if (startDate) {
        conditions.push(gte(normalizedEvents.timestamp, startDate));
      }
      if (endDate) {
        conditions.push(lte(normalizedEvents.timestamp, endDate));
      }

      const results = await db
        .select()
        .from(normalizedEvents)
        .where(and(...conditions))
        .orderBy(desc(normalizedEvents.timestamp))
        .limit(limit);

      return JSON.stringify(results);
    } catch (err: any) {
      return `Error retrieving health events: ${err.message || err}`;
    }
  },
  {
    name: "get_health_events",
    description: "Fetch health biometrics, sleep summaries, workout details, activity scores, and physical health events.",
    schema: z.object({
      startDate: z.string().optional().describe("Start date filter in ISO format (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("End date filter in ISO format (YYYY-MM-DD)"),
      limit: z.number().optional().describe("Maximum events to retrieve (default 50)"),
    }),
  }
);

/**
 * getHomeEventsTool:
 * Specifically fetches smart home and IoT protocol events (Home Assistant, MQTT, Zigbee, etc.).
 */
export const getHomeEventsTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const { startDate, endDate, limit = 50 } = input;
      const conditions = [
        eq(normalizedEvents.userId, userId),
        eq(normalizedEvents.workspaceId, workspaceId),
        or(
          eq(normalizedEvents.category, "Smart Home"),
          eq(normalizedEvents.category, "IoT")
        ),
      ];

      if (startDate) {
        conditions.push(gte(normalizedEvents.timestamp, startDate));
      }
      if (endDate) {
        conditions.push(lte(normalizedEvents.timestamp, endDate));
      }

      const results = await db
        .select()
        .from(normalizedEvents)
        .where(and(...conditions))
        .orderBy(desc(normalizedEvents.timestamp))
        .limit(limit);

      return JSON.stringify(results);
    } catch (err: any) {
      return `Error retrieving smart home events: ${err.message || err}`;
    }
  },
  {
    name: "get_home_events",
    description: "Fetch events originating from your smart home controllers, smart lights, switches, thermostats, and IoT sensor telemetry.",
    schema: z.object({
      startDate: z.string().optional().describe("Start date filter in ISO format"),
      endDate: z.string().optional().describe("End date filter in ISO format"),
      limit: z.number().optional().describe("Maximum events to retrieve"),
    }),
  }
);

/**
 * getSecurityEventsTool:
 * Specifically fetches security alerts (ONVIF CCTV motion, person detection, Ring doorbell triggers).
 */
export const getSecurityEventsTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const { startDate, endDate, limit = 50 } = input;
      const conditions = [
        eq(normalizedEvents.userId, userId),
        eq(normalizedEvents.workspaceId, workspaceId),
        eq(normalizedEvents.category, "Security"),
      ];

      if (startDate) {
        conditions.push(gte(normalizedEvents.timestamp, startDate));
      }
      if (endDate) {
        conditions.push(lte(normalizedEvents.timestamp, endDate));
      }

      const results = await db
        .select()
        .from(normalizedEvents)
        .where(and(...conditions))
        .orderBy(desc(normalizedEvents.timestamp))
        .limit(limit);

      return JSON.stringify(results);
    } catch (err: any) {
      return `Error retrieving security events: ${err.message || err}`;
    }
  },
  {
    name: "get_security_events",
    description: "Fetch camera alerts, CCTV motion/person detection, door locks, alarm triggers, and security log entries.",
    schema: z.object({
      startDate: z.string().optional().describe("Start date filter in ISO format"),
      endDate: z.string().optional().describe("End date filter in ISO format"),
      limit: z.number().optional().describe("Maximum events to retrieve"),
    }),
  }
);

/**
 * searchTimelineTool:
 * Performs text matching across event summaries to retrieve relevant timeline memory slices.
 */
export const searchTimelineTool = (userId: string, workspaceId: string) => tool(
  async (input: any) => {
    try {
      const { query, category, limit = 30 } = input;
      const conditions = [
        eq(normalizedEvents.userId, userId),
        eq(normalizedEvents.workspaceId, workspaceId),
        ilike(normalizedEvents.summary, `%${query}%`),
      ];

      if (category) {
        conditions.push(eq(normalizedEvents.category, category));
      }

      const results = await db
        .select()
        .from(normalizedEvents)
        .where(and(...conditions))
        .orderBy(desc(normalizedEvents.timestamp))
        .limit(limit);

      return JSON.stringify(results);
    } catch (err: any) {
      return `Error searching life timeline: ${err.message || err}`;
    }
  },
  {
    name: "search_timeline",
    description: "Perform search across your life timeline events summary (e.g. search for 'productive', 'motion', 'sleep', 'flight').",
    schema: z.object({
      query: z.string().describe("Search term or keyword to match against event summaries"),
      category: z.string().optional().describe("Filter by category during search, e.g. 'Health', 'Productivity', 'Smart Home'"),
      limit: z.number().optional().describe("Maximum matches to return (default 30)"),
    }),
  }
);
