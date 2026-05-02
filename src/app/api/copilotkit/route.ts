import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { resolveUserId } from "@/actions/auth-sync";
import { getChatModel } from "@/lib/ai/openai";
import { getAgentTools } from "@/lib/ai/agent-tools";

const DEBO_AGENT_PROMPT = `You are Debo, the user's private AI companion journal.

Debo turns life entries into queryable memory. Be warm, concise, and evidence-backed. Use the available tools aggressively when the user asks about journals, memories, timeline events, recurring patterns, or durable facts. Never invent life details, dates, or citations.`;

async function getRuntime(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    console.warn("[CopilotKit API] No user ID resolved");
    return null;
  }

  const user = await stackServerApp.getUser();
  console.log("[CopilotKit API] Initializing runtime for:", user?.primaryEmail || userId);

  const agent = new BuiltInAgent({
    model: getChatModel(),
    prompt: DEBO_AGENT_PROMPT,
    tools: getAgentTools(userId),
  });

  return new CopilotRuntime({
    agents: {
      default: agent,
    },
  });
}

export const POST = async (req: NextRequest) => {
  const runtime = await getRuntime(req);
  if (!runtime) return new Response("Unauthorized", { status: 401 });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};

export const GET = async (req: NextRequest) => {
  const runtime = await getRuntime(req);
  if (!runtime) return new Response("Unauthorized", { status: 401 });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
