import { mastra } from "@/mastra";
import { resolveUserId } from "@/actions/auth-sync";
import { RequestContext } from "@mastra/core/request-context";
import { toAISdkStream } from "@mastra/ai-sdk";
import { NextRequest } from "next/server";
import { ModelMessage } from "ai";

export async function POST(req: NextRequest) {
  let userId = "test-user-bypass";
  try {
    const resolvedId = await resolveUserId();
    if (resolvedId) {
      userId = resolvedId;
    }
  } catch (e) {
    console.error("DEBUG: Auth resolution failed, using bypass", e);
  }

  // Get Cloudflare context for environment variables if needed
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const cf = getCloudflareContext();
    if (cf?.env) {
      // If we are on Cloudflare, we might need to sync environment variables
      // though next dev usually handles this via initOpenNextCloudflareForDev()
      Object.assign(process.env, cf.env);
    }
  } catch (e) {
    // console.log("DEBUG: Cloudflare context not available");
  }

  try {
    const { messages } = (await req.json()) as { messages: ModelMessage[] };
    const agent = mastra.getAgent("debo");

    const requestContext = new RequestContext();
    requestContext.set("userId", userId);

    const result = await agent.stream(messages, {
      memory: {
        thread: "default", // We can improve this with thread IDs later
        resource: userId,
      },
      requestContext,
    });

    const stream = toAISdkStream(result, { from: "agent", version: "v6" });
    return new Response(stream as any);
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return new Response(JSON.stringify({ error: "Intelligence engine error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
