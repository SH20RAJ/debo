import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { db } from "@/db";
import { journals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MemoryClient } from "mem0ai";

// Note: In a real production app, you'd want to authenticate this MCP endpoint.
// For now, we'll implement the server logic.

const server = new McpServer({
  name: "Debo Journal Server",
  version: "1.0.0",
});

// Tool: Read Journal Entries
server.tool(
  "read_journal_entries",
  "List the user's journal entries.",
  {
    limit: z.number().optional().default(10),
    userId: z.string().describe("The ID of the user whose journals to read."),
  },
  async ({ limit, userId }) => {
    const entries = await db.query.journals.findMany({
      where: eq(journals.userId, userId),
      orderBy: [desc(journals.createdAt)],
      limit,
    });

    return {
      content: [
        {
          type: "text",
          text: entries.length > 0 
            ? entries.map(e => `[${e.createdAt.toISOString()}] ${e.content}`).join("\n---\n")
            : "No journal entries found.",
        },
      ],
    };
  }
);

// Tool: Get Memories Summary
server.tool(
  "get_memories_summary",
  "Get summarized facts and memories about the user from Mem0.",
  {
    userId: z.string().describe("The ID of the user."),
  },
  async ({ userId }) => {
    const mem0 = new MemoryClient({ 
        apiKey: process.env.MEM0_API_KEY!, 
        host: "https://api.mem0.ai" 
    });
    
    try {
        const memoriesResult = await mem0.getAll(userId);
        const memories = (memoriesResult as any).results || memoriesResult;

        return {
            content: [
                {
                    type: "text",
                    text: memories && Array.isArray(memories) && memories.length > 0
                        ? memories.map((m: any) => `- ${m.memory}`).join("\n")
                        : "No memories found for this user.",
                },
            ],
        };
    } catch (e) {
        return {
            content: [{ type: "text", text: "Error fetching memories." }],
            isError: true,
        };
    }
  }
);

export async function GET(req: Request) {
    // Note: This is a placeholder as SSEServerTransport requires a Node.js response object.
    // In App Router, we'd typically use a different transport or a polyfill.
    // Fixing TSC error for now.
    const res = {} as any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transport = new SSEServerTransport("/api/mcp/messages", res);
    
    return new Response("MCP Server Endpoint", { status: 200 });
}
