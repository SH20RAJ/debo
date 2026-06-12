import { Composio } from "@composio/core";
import { db } from "@debo/db";
import { connectorAccounts } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const SUPPORTED_PROVIDERS = [
  "gmail",
  "google_calendar",
  "notion",
  "github",
  "slack",
  "drive",
  "jira",
  "hubspot",
  "discord",
  "trello",
  "zoom",
  "salesforce",
] as const;

export type ConnectorProvider = string;

const PROVIDER_TO_TOOLKIT: Record<string, string> = {
  gmail: "gmail",
  google_calendar: "googlecalendar",
  googlecalendar: "googlecalendar",
  notion: "notion",
  github: "github",
  slack: "slack",
  drive: "googledrive",
  googledrive: "googledrive",
  jira: "jira",
  hubspot: "hubspot",
  discord: "discord",
  trello: "trello",
  zoom: "zoom",
  salesforce: "salesforce",
};

let cached: Composio | null = null;

export function getComposio(): Composio | null {
  if (cached) return cached;
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) return null;
  cached = new Composio({ apiKey });
  return cached;
}

export function isComposioConfigured(): boolean {
  return Boolean(process.env.COMPOSIO_API_KEY);
}

export function isSupportedProvider(p: string): boolean {
  return true;
}

export function getToolkitSlug(p: string): string {
  return PROVIDER_TO_TOOLKIT[p.toLowerCase()] || p;
}

function jsonSchemaToZod(schema: any): z.ZodType<any> {
  if (!schema) return z.any();
  
  if (schema.type === "string") {
    let zStr = z.string();
    if (schema.description) zStr = zStr.describe(schema.description);
    return zStr;
  }
  
  if (schema.type === "number" || schema.type === "integer") {
    let zNum = z.number();
    if (schema.description) zNum = zNum.describe(schema.description);
    return zNum;
  }
  
  if (schema.type === "boolean") {
    let zBool = z.boolean();
    if (schema.description) zBool = zBool.describe(schema.description);
    return zBool;
  }
  
  if (schema.type === "array") {
    let zArr = z.array(jsonSchemaToZod(schema.items || { type: "string" }));
    if (schema.description) zArr = zArr.describe(schema.description);
    return zArr;
  }
  
  if (schema.type === "object") {
    const shape: Record<string, z.ZodType<any>> = {};
    const required = schema.required || [];
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        let fieldSchema = jsonSchemaToZod(prop);
        if (!required.includes(key)) {
          fieldSchema = fieldSchema.optional();
        }
        shape[key] = fieldSchema;
      }
    }
    
    let zObj = z.object(shape);
    if (schema.description) {
      zObj = zObj.describe(schema.description) as any;
    }
    return zObj;
  }
  
  return z.any();
}

export async function getComposioToolsForUser(userId: string, workspaceId: string): Promise<any[]> {
  if (!isComposioConfigured()) return [];
  const composio = getComposio();
  if (!composio) return [];

  try {
    const activeConnections = await db
      .select()
      .from(connectorAccounts)
      .where(
        and(
          eq(connectorAccounts.userId, userId),
          eq(connectorAccounts.workspaceId, workspaceId),
          eq(connectorAccounts.status, "connected"),
        )
      );

    if (activeConnections.length === 0) return [];

    const toolsList: any[] = [];

    for (const conn of activeConnections) {
      const toolkitSlug = getToolkitSlug(conn.provider);
      try {
        const rawTools = await (composio.tools as any).getRawComposioTools({
          toolkits: [toolkitSlug],
          important: true
        });

        if (!rawTools || rawTools.length === 0) continue;

        for (const rawTool of rawTools) {
          if (rawTool.isDeprecated) continue;
          
          const zodSchema = jsonSchemaToZod(rawTool.inputParameters);

          const langChainTool = tool(
            async (input: any) => {
              try {
                const executionResult = await composio.tools.execute(rawTool.slug, {
                  arguments: input,
                  userId: userId,
                  connectedAccountId: conn.externalAccountId || undefined
                });
                return typeof executionResult === "string" ? executionResult : JSON.stringify(executionResult);
              } catch (err: any) {
                console.error(`Error executing tool ${rawTool.slug}:`, err);
                return `Error executing action ${rawTool.name || rawTool.slug}: ${err.message || err}`;
              }
            },
            {
              name: rawTool.slug,
              description: rawTool.description,
              schema: zodSchema,
            }
          );

          toolsList.push(langChainTool);
        }
      } catch (err) {
        console.warn(`[getComposioToolsForUser] Failed to fetch tools for toolkit ${toolkitSlug}:`, err);
      }
    }

    return toolsList;
  } catch (err) {
    console.error("[getComposioToolsForUser] failed:", err);
    return [];
  }
}
