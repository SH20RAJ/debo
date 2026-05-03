import { mastra } from "@/mastra";
import { resolveUserId } from "@/actions/auth-sync";
import { RequestContext } from "@mastra/core/request-context";
import { toAISdkStream } from "@mastra/ai-sdk";
import { NextRequest } from "next/server";
import { ModelMessage } from "ai";

export async function POST(req: NextRequest) {
  // const userId = await resolveUserId();
  // if (!userId) {
  //   return new Response("Unauthorized", { status: 401 });
  // }
  const userId = "test-user-bypass";

  console.log("DEBUG: process.env keys =", Object.keys(process.env).filter(k => k.includes("OPENAI") || k.includes("STACK")));
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    console.log("DEBUG: getCloudflareContext().env =", getCloudflareContext()?.env);
  } catch (e) {
    console.log("DEBUG: Failed to get Cloudflare context", e);
  }
  console.log("DEBUG: OPENAI_BASE_URL =", process.env.OPENAI_BASE_URL);

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
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  console.log("GLOBAL FETCH INTERCEPT:", url);
  return originalFetch(url, options);
};
