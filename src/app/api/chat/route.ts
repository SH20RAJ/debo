import { mastra } from "@/mastra";
import { resolveUserId } from "@/actions/auth-sync";
import { RequestContext } from "@mastra/core/request-context";
import { toAISdkStream } from "@mastra/ai-sdk";
import { NextRequest } from "next/server";
import { ModelMessage, createUIMessageStreamResponse } from "ai";

export async function POST(req: NextRequest) {
  let userId = "anonymous";
  try {
    const resolvedId = await resolveUserId();
    if (resolvedId) {
      userId = resolvedId;
    }
  } catch (e) {
    console.error("DEBUG: Auth resolution failed, using fallback", e);
  }

  // Cloudflare context sync
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const cf = getCloudflareContext();
    if (cf?.env) {
      Object.assign(process.env, cf.env);
    }
  } catch {
    // Not on Cloudflare
  }

  try {
    const body = await req.json();
    const { messages, id: threadId } = body as { messages: ModelMessage[]; id?: string };
    
    // Use the threadId from assistant-ui, fallback to a default
    const resolvedThreadId = threadId || "default";

    const agent = mastra.getAgent("debo");

    const requestContext = new RequestContext();
    requestContext.set("userId", userId);

    const result = await agent.stream(messages, {
      memory: {
        thread: resolvedThreadId,
        resource: userId,
      },
      requestContext,
    });

    const stream = toAISdkStream(result, { from: "agent", version: "v6" });
    return createUIMessageStreamResponse({
      stream,
    });
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return new Response(
      JSON.stringify({
        error: "Intelligence engine error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
