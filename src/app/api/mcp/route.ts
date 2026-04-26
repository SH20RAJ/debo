import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import Mem0 from "mem0ai";
import { db } from "@/db";
import { journals, userPreferences } from "@/db/schema";
import { eq, and, gte, lte, desc, ilike, sql } from "drizzle-orm";
import crypto from "crypto";

// Initialize Mem0 client
const mem0 = new Mem0({
  apiKey: process.env.MEM0_API_KEY || "dummy",
});

const server = new Server({
  name: "debo-mcp-server",
  version: "1.1.0",
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
    tools: [
      {
        name: "create_journal",
        description: "Create a new journal entry in Debo.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "The content of the journal entry (markdown supported)." }
          },
          required: ["content"]
        }
      },
      {
        name: "search_journals",
        description: "Search through historical journal entries using keywords and date filters.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Keyword search query." },
            startDate: { type: "string", description: "ISO date string for start of range." },
            endDate: { type: "string", description: "ISO date string for end of range." },
            limit: { type: "number", default: 10 }
          }
        }
      },
      {
        name: "add_memory",
        description: "Add a new persistent fact or memory to the intelligence context.",
        inputSchema: {
          type: "object",
          properties: {
            fact: { type: "string", description: "The specific fact or memory to store." }
          },
          required: ["fact"]
        }
      },
      {
        name: "search_memories",
        description: "Semantically search through stored facts and memories.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The semantic search query." }
          },
          required: ["query"]
        }
      }
    ]
  };
});

// Tool Implementation
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const userId = (extra as any).userId;
  if (!userId) throw new Error("Unauthorized");

  const { name, arguments: args } = request.params;

  switch (name) {
    case "create_journal": {
      const { content } = args as { content: string };
      const id = crypto.randomUUID();
      await db.insert(journals).values({
        id,
        userId,
        content,
      });
      return { content: [{ type: "text", text: `Journal entry created with ID: ${id}` }] };
    }

    case "search_journals": {
      const { query, startDate, endDate, limit = 10 } = args as { query?: string, startDate?: string, endDate?: string, limit?: number };
      
      const conditions = [eq(journals.userId, userId)];
      if (query) conditions.push(ilike(journals.content, `%${query}%`));
      if (startDate) conditions.push(gte(journals.createdAt, new Date(startDate)));
      if (endDate) conditions.push(lte(journals.createdAt, new Date(endDate)));

      const results = await db.query.journals.findMany({
        where: and(...conditions),
        orderBy: [desc(journals.createdAt)],
        limit,
      });

      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }

    case "add_memory": {
      const { fact } = args as { fact: string };
      const result = await mem0.add([{ role: "user", content: fact }], { user_id: userId });
      return { content: [{ type: "text", text: `Memory stored successfully: ${JSON.stringify(result)}` }] };
    }

    case "search_memories": {
      const { query } = args as { query: string };
      const result = await mem0.search(query, { user_id: userId });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Next.js Route Handlers
export async function POST(req: NextRequest) {
  const userId = await validateRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const response = await server.handleRequest(body, { userId });
  return NextResponse.json(response);
}

// Minimalistic GET to check if server is up
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: "active", 
    message: "Debo MCP Server is running. Use POST with Bearer token for tool access.",
    version: "1.1.0"
  });
}
