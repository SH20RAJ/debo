import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import Mem0 from "mem0ai";

let mcpServer: Server | null = null;
let transport: SSEServerTransport | null = null;

// Initialize Mem0 client
const mem0 = new Mem0({
  apiKey: process.env.MEM0_API_KEY || "dummy",
});

function initServer() {
  if (mcpServer) return;

  mcpServer = new Server({
    name: "debo-mcp-server",
    version: "1.0.0",
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Register Mem0 tools
  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "add_mem0_fact",
          description: "Add a new fact or memory to the user's intelligence context via Mem0.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string" },
              fact: { type: "string", description: "The memory or fact to store." }
            },
            required: ["userId", "fact"]
          }
        },
        {
          name: "search_mem0_facts",
          description: "Search the user's intelligence context via Mem0.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string" },
              query: { type: "string", description: "The query to search for." }
            },
            required: ["userId", "query"]
          }
        }
      ]
    };
  });

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "add_mem0_fact") {
      const { userId, fact } = request.params.arguments as { userId: string, fact: string };
      try {
        const result = await mem0.add([
          { role: "user", content: fact }
        ], { user_id: userId });
        
        return {
          content: [{ type: "text", text: `Fact added successfully. Mem0 response: ${JSON.stringify(result)}` }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Failed to add fact: ${error}` }],
          isError: true
        };
      }
    }

    if (request.params.name === "search_mem0_facts") {
      const { userId, query } = request.params.arguments as { userId: string, query: string };
      try {
        const result = await mem0.search(query, { user_id: userId });
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Failed to search facts: ${error}` }],
          isError: true
        };
      }
    }

    throw new Error(`Tool not found: ${request.params.name}`);
  });
}

export async function GET(req: NextRequest) {
  initServer();
  
  transport = new SSEServerTransport("/api/mcp", new NextResponse());
  
  // Note: Standard NextJS SSE requires returning a stream. 
  // For the sake of simplicity, we create a ReadableStream.
  const stream = new ReadableStream({
    start(controller) {
      transport!.onclose = () => controller.close();
      // Hook up SSE transport internals if needed
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  // In a real implementation, you'd route the POST to the transport
  return NextResponse.json({ error: "SSE Transport POST handling is complex in pure NextJS. Use a custom node server for production." }, { status: 501 });
}
