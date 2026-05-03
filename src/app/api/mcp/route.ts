import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";

// Persistent server instance
const server = new Server(
  {
    name: "debo-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Dynamically load tools to avoid circular dependencies at build/init time
 */
async function getTools() {
  const { deboTools } = await import("@/mastra/tools/debo-tools");
  return deboTools;
}

// Register List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const deboTools = await getTools();
  const tools = Object.entries(deboTools).map(([id, tool]) => ({
    name: (tool as any).id || id,
    description: (tool as any).description || `Mastra tool: ${id}`,
    inputSchema: (tool as any).inputSchema || { type: "object", properties: {} },
  }));

  return { tools };
});

// Register Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const deboTools = await getTools();
  const tool: any = Object.values(deboTools).find((t: any) => t.id === name) || (deboTools as any)[name];

  if (!tool) {
    throw new Error(`Tool ${name} not found`);
  }

  try {
    const result = await tool.execute({
      context: args as any,
      suspend: async () => {},
    });

    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check - Find user by Bearer token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32601, message: "Unauthorized: Missing Bearer token" }
      }, { status: 401 });
    }

    const mcpKey = authHeader.replace("Bearer ", "");
    const pref = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.mcpKey, mcpKey)
    });

    if (!pref) {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32601, message: "Unauthorized: Invalid MCP Key" }
      }, { status: 401 });
    }

    const userId = pref.userId;
    const body = await req.json();
    
    let jsonRpcResponse: any = null;
    const transport = {
        onclose: () => {},
        onerror: () => {},
        onmessage: () => {},
        start: async () => {},
        send: async (msg: any) => {
            jsonRpcResponse = msg;
        },
        close: async () => {},
    };

    // Inject userId into the request context for tools
    // We override execute to pass the userId
    const originalRequestHandler = (server as any)._requestHandlers.get(CallToolRequestSchema.method);
    
    // We need to pass the userId to the tool execution.
    // The current server.setRequestHandler doesn't easily allow passing per-request context.
    // So we'll temporarily store it or pass it via a side channel.
    // For now, we'll just ensure the tool execution context has it.

    await server.connect(transport as any);
    
    // We'll wrap the call to handle the context
    if (body.method === "tools/call") {
        const { name, arguments: args } = body.params;
        const deboTools = await getTools();
        const tool: any = Object.values(deboTools).find((t: any) => t.id === name) || (deboTools as any)[name];

        if (!tool) {
            jsonRpcResponse = {
                jsonrpc: "2.0",
                id: body.id,
                error: { code: -32602, message: `Tool ${name} not found` }
            };
        } else {
            try {
                const result = await tool.execute({
                    context: args as any,
                    requestContext: { all: { userId } }, // Injecting userId here!
                    suspend: async () => {},
                });

                jsonRpcResponse = {
                    jsonrpc: "2.0",
                    id: body.id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
                            },
                        ],
                    }
                };
            } catch (error) {
                jsonRpcResponse = {
                    jsonrpc: "2.0",
                    id: body.id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        isError: true,
                    }
                };
            }
        }
    } else {
        await (transport as any).onmessage(body);
    }
    
    if (!jsonRpcResponse) {
        return NextResponse.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32603, message: "Internal error: No response generated" }
        }, { status: 500 });
    }

    return NextResponse.json(jsonRpcResponse);
  } catch (error) {
    return NextResponse.json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : "Internal error",
      },
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const deboTools = await getTools();
    return NextResponse.json({
      name: "debo-mcp-server",
      status: "active",
      tools: Object.keys(deboTools).length,
    });
  } catch (error) {
    return NextResponse.json({
        status: "error",
        message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
