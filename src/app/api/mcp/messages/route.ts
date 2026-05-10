import { NextRequest, NextResponse } from "next/server";
import { createDeboRuntimeTools } from "@/lib/chat/debo-tools";

const SERVER_INFO = {
  name: "debo-mcp-server",
  version: "2.0.0",
};

interface McpRequest {
  id: string | number;
  method: string;
  params?: any;
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const message = await req.json() as McpRequest;
    const { id, method, params } = message;

    const deboTools = createDeboRuntimeTools(userId, { includeMcpTools: true });

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
    return NextResponse.json({ error: "MCP Messages Error", message: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
