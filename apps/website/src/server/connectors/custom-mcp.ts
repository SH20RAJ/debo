import { db } from "@debo/db";
import { customMcpServers } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

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

export async function getCustomMcpToolsForUser(userId: string, workspaceId: string): Promise<any[]> {
  try {
    const servers = await db
      .select()
      .from(customMcpServers)
      .where(
        and(
          eq(customMcpServers.userId, userId),
          eq(customMcpServers.workspaceId, workspaceId)
        )
      );

    if (servers.length === 0) return [];

    const toolsList: any[] = [];

    for (const server of servers) {
      let headers: Record<string, string> = {};
      if (server.headersJson) {
        try {
          headers = JSON.parse(server.headersJson);
        } catch {
          console.warn(`[custom-mcp] Failed to parse headers for ${server.name}`);
        }
      }

      try {
        // Query remote HTTP MCP server for its tools list using standard JSON-RPC
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

        const response = await fetch(server.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "tools/list",
            params: {},
            id: 1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          console.warn(`[custom-mcp] Server ${server.name} returned status ${response.status}`);
          continue;
        }

        const data = await response.json();
        const mcpTools = data.result?.tools || [];

        for (const mcpTool of mcpTools) {
          const zodSchema = jsonSchemaToZod(mcpTool.inputSchema);
          
          // Prefix tool name to avoid collisions
          const prefix = server.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
          const toolName = `${prefix}_${mcpTool.name}`;

          const langChainTool = tool(
            async (input: any) => {
              try {
                const callController = new AbortController();
                const callTimeout = setTimeout(() => callController.abort(), 8000); // 8s timeout

                const callRes = await fetch(server.url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...headers,
                  },
                  body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/call",
                    params: {
                      name: mcpTool.name,
                      arguments: input,
                    },
                    id: 1,
                  }),
                  signal: callController.signal,
                });
                clearTimeout(callTimeout);

                if (!callRes.ok) {
                  return `Failed to execute remote tool: ${callRes.statusText}`;
                }

                const callData = await callRes.json();
                if (callData.error) {
                  return `Remote execution error: ${callData.error.message || JSON.stringify(callData.error)}`;
                }

                const content = callData.result?.content || [];
                const text = content.map((c: any) => c.text || "").join("\n");
                return text || JSON.stringify(callData.result);
              } catch (e: any) {
                console.error(`[custom-mcp] Tool execution failed for ${toolName}:`, e);
                return `Execution error: ${e.message || e}`;
              }
            },
            {
              name: toolName,
              description: `[MCP: ${server.name}] ${mcpTool.description}`,
              schema: zodSchema,
            }
          );

          toolsList.push(langChainTool);
        }
      } catch (err) {
        console.warn(`[custom-mcp] Failed to query tools for ${server.name}:`, err);
      }
    }

    return toolsList;
  } catch (err) {
    console.error("[getCustomMcpToolsForUser] failed:", err);
    return [];
  }
}
