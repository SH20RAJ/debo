import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { createDeboRuntimeTools } from "@/lib/chat/debo-tools";
import { eq } from "drizzle-orm";

const SERVER_INFO = {
  name: "debo-mcp-server",
  version: "2.0.0",
};

const MCP_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Last-Event-ID",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: MCP_HEADERS });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const mcpKey = authHeader.replace("Bearer ", "").trim();
  const pref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.mcpKey, mcpKey),
  });

  if (!pref) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send endpoint notification
      const endpointMessage = `event: endpoint\ndata: /api/mcp/messages?userId=${pref.userId}\n\n`;
      controller.enqueue(encoder.encode(endpointMessage));

      // Keep alive heartbeat
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n"));
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, { headers: MCP_HEADERS });
}

interface McpRequest {
  id: string | number;
  method: string;
  params?: any;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mcpKey = authHeader.replace("Bearer ", "").trim();
  const pref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.mcpKey, mcpKey),
  });

  if (!pref) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const message = await req.json() as McpRequest;
    const { id, method, params } = message;

    // Use a very safe tool creation for list
    const deboTools = createDeboRuntimeTools(pref.userId, { includeMcpTools: true });

    switch (method) {
      case "initialize":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: SERVER_INFO,
            instructions: "You are Debo AI - the user's personal context layer. Use get_info to understand the user's life context."
          }
        });

      case "notifications/initialized":
        return new NextResponse(null, { status: 204 });

      case "tools/list": {
        const tools = Object.entries(deboTools).map(([entryId, tool]: [string, any]) => {
          const name = tool.id || entryId;
          const snakeName = name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
          
          let properties: Record<string, any> = {};
          try {
              if (tool.inputSchema?._def?.shape) {
                const shape = typeof tool.inputSchema._def.shape === "function" 
                  ? tool.inputSchema._def.shape() 
                  : tool.inputSchema._def.shape;
                Object.keys(shape).forEach(key => {
                  properties[key] = { type: "string" };
                });
              }
          } catch (e) {
              console.warn(`Could not extract schema for tool ${name}`);
          }

          return {
            name: snakeName,
            description: tool.description || `Debo tool: ${name}`,
            inputSchema: {
              type: "object",
              properties,
              required: Object.keys(properties)
            }
          };
        });
        return NextResponse.json({ jsonrpc: "2.0", id, result: { tools } });
      }

      case "tools/call": {
        const name = params?.name;
        const args = params?.arguments || {};
        
        const toolEntry = Object.entries(deboTools).find(([entryId, tool]: [string, any]) => {
          const toolName = tool.id || entryId;
          const snakeName = toolName.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
          return snakeName === name || toolName === name;
        });

        if (!toolEntry) {
          return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `Tool ${name} not found` } });
        }

        const tool = toolEntry[1] as any;
        try {
          const result = await tool.execute(args);
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }]
            }
          });
        } catch (err) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }],
              isError: true
            }
          });
        }
      }

      default:
        return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method ${method} not found` } });
    }
  } catch (err) {
    return NextResponse.json({ error: "MCP Processing Error", message: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
