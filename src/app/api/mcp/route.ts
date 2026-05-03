import { NextRequest, NextResponse } from "next/server";
import { RequestContext } from "@mastra/core/request-context";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deboTools } from "@/mastra/tools/debo-tools";

const server = new Server({
  name: "debo-mcp-server",
  version: "2.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

// Auth Helper
async function validateRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const key = authHeader.split(" ")[1];
  
  const pref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.mcpKey, key)
  });

  return pref?.userId || null;
}

// Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(deboTools).map(tool => ({
        name: tool.id,
        description: tool.description,
        inputSchema: tool.inputSchema // Mastra uses Zod, but MCP expects JSON Schema. 
                                     // Actually, Mastra Tool objects have an inputSchema that we might need to convert.
    }))
  };
});

// Tool Implementation
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;
  const userId = (extra as { userId?: string }).userId;
  if (!userId) throw new Error("Unauthorized");

  // Find the tool by name (tool.id)
  const tool = Object.values(deboTools).find(t => t.id === name);
  
  if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
  }

  // Execute the tool with user context
  const requestContext = new RequestContext();
  requestContext.set("userId", userId);

  if (!tool.execute) {
    throw new Error(`Tool ${name} does not have an execute function`);
  }

  const result = await tool.execute(args as any, {
      requestContext,
  });

  return { 
      content: [{ 
          type: "text", 
          text: typeof result === 'string' ? result : JSON.stringify(result) 
      }] 
  };
});

// Next.js Route Handlers
export async function POST(req: NextRequest) {
  const userId = await validateRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  
  // Minimal handleRequest mock since the SDK version might vary
  try {
      const response = await (server as any).handleRequest(body, { userId });
      return NextResponse.json(response);
  } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: "active", 
    message: "Debo MCP Server (Mastra-Powered) is running.",
    version: "2.0.0"
  });
}
