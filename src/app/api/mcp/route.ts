import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { db } from "@/db";
import { journals, userPreferences } from "@/db/schema";
import { eq, and, gte, lte, desc, ilike, sql } from "drizzle-orm";
import crypto from "crypto";
import { nango } from "@/lib/nango";
import { indexJournal } from "@/lib/vector/search";
import { upsertMemoryGraphForJournal } from "@/lib/life/graph";
import { extractMemory } from "@/lib/memory/extract";
import { getRelevantMemories } from "@/lib/memory/query";
import { storeMemory } from "@/lib/memory/store";

const server = new Server({
  name: "debo-mcp-server",
  version: "1.2.0",
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
            title: { type: "string", description: "Optional title for the entry." },
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
        description: "Add a new persistent fact or memory to the first-party intelligence context.",
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
        description: "Search through stored facts and memories in the internal memory engine.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The semantic search query." }
          },
          required: ["query"]
        }
      },
      {
        name: "list_my_connections",
        description: "List all currently connected third-party integrations (e.g., google-calendar, github, etc.) for the current user.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "run_action",
        description: "Perform an API action (GET, POST, etc.) on a connected integration. This allows calling any endpoint of the connected service (Calendar, GitHub, Mail, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            providerConfigKey: { type: "string", description: "The integration unique key (e.g., 'google-calendar', 'github', 'google-mail')." },
            method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], description: "HTTP method to use." },
            endpoint: { type: "string", description: "The API endpoint path (e.g., '/primary/events' or '/user/repos')." },
            params: { type: "object", description: "Query parameters for the request." },
            data: { type: "object", description: "JSON body for POST/PUT/PATCH requests." }
          },
          required: ["providerConfigKey", "method", "endpoint"]
        }
      },
      {
        name: "get_integration_guide",
        description: "Get documentation hints for a specific integration to understand available endpoints and payload structures.",
        inputSchema: {
          type: "object",
          properties: {
            providerConfigKey: { type: "string", description: "The integration unique key." }
          },
          required: ["providerConfigKey"]
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
      const { content, title } = args as { content: string, title?: string };
      const id = crypto.randomUUID();
      const now = new Date();
      const journal = {
        id,
        userId,
        title: title || null,
        content,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(journals).values(journal);

      try {
        await indexJournal(journal);
        await upsertMemoryGraphForJournal(userId, journal);
        const extracted = await extractMemory(content);
        await storeMemory(userId, extracted);
      } catch (error) {
        console.error("Failed to index MCP journal:", error);
      }

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
      const extracted = await extractMemory(fact);
      const result = await storeMemory(userId, {
        facts: extracted.facts.length > 0 ? extracted.facts : [fact],
        entities: extracted.entities,
        emotions: extracted.emotions,
        topics: extracted.topics,
      });
      return { content: [{ type: "text", text: `Memory stored successfully: ${JSON.stringify(result)}` }] };
    }

    case "search_memories": {
      const { query } = args as { query: string };
      const result = await getRelevantMemories(userId, query);
      return { content: [{ type: "text", text: JSON.stringify(result.items) }] };
    }

    case "list_my_connections": {
        const connections = await nango.listConnections(userId);
        return { content: [{ type: "text", text: JSON.stringify(connections) }] };
    }

    case "run_action": {
        const { providerConfigKey, method, endpoint, params, data } = args as any;
        const response = await nango.proxy({
            method,
            endpoint,
            providerConfigKey,
            connectionId: userId,
            params,
            data
        });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
    }

    case "get_integration_guide": {
        const { providerConfigKey } = args as { providerConfigKey: string };
        const guides: Record<string, string> = {
            "google-calendar": "Base URL: https://www.googleapis.com/calendar/v3. Common endpoints: /primary/events (GET to list, POST to create). Refer to Google Calendar API v3 docs.",
            "github": "Base URL: https://api.github.com. Common endpoints: /user/repos (GET), /repos/{owner}/{repo}/issues (POST). Refer to GitHub REST API docs.",
            "google-mail": "Base URL: https://www.googleapis.com/gmail/v1/users/me. Common endpoints: /messages (GET), /messages/send (POST). Refer to Gmail API v1 docs.",
            "slack": "Base URL: https://slack.com/api. Common endpoints: /chat.postMessage (POST). Refer to Slack Web API docs."
        };
        return { 
            content: [{ 
                type: "text", 
                text: guides[providerConfigKey] || `Integration ${providerConfigKey} uses standard REST API structure. Refer to the provider's official developer documentation for endpoints and payload requirements.` 
            }] 
        };
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
  const response = await (server as any).handleRequest(body, { userId });
  return NextResponse.json(response);
}

// Minimalistic GET to check if server is up
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: "active", 
    message: "Debo MCP Server is running. Use POST with Bearer token for tool access.",
    version: "1.2.0"
  });
}
