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
