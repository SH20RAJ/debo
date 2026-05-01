import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { getOpenAIClient, DEFAULT_CHAT_MODEL } from "@/lib/ai/openai";
import { getAgentTools } from "@/lib/ai/agent-tools";

// Use the same model as the rest of the app so CopilotKit doesn't default to gpt-4o
const serviceAdapter = new OpenAIAdapter({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openai: getOpenAIClient() as any,
  model: process.env.OPENAI_MODEL || DEFAULT_CHAT_MODEL,
});

export const POST = async (req: NextRequest) => {
  const user = await stackServerApp.getUser();

  if (!user) {
    console.error("[CopilotKit API] Unauthorized - No session found.");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("[CopilotKit API] Authenticated user:", user.primaryEmail);

  const runtime = new CopilotRuntime({
    actions: getAgentTools(user.id),
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
