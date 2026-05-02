import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  BuiltInAgent,
} from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { resolveUserId } from "@/actions/auth-sync";
import { getChatModel } from "@/lib/ai/openai";
import { getAgentTools } from "@/lib/ai/agent-tools";

const DEBO_AGENT_PROMPT = `You are Debo, the user's private AI companion journal.

Debo turns life entries into queryable memory. Be warm, concise, and evidence-backed. Use the available tools aggressively when the user asks about journals, memories, timeline events, recurring patterns, or durable facts. Never invent life details, dates, or citations.

When useful, render structured results with render_journal_card, render_timeline_item, or render_insight_summary. Prefer concrete dates, short summaries, and useful next actions over generic advice.

IMPORTANT: When you decide to use a tool, use the tool calling API. Do not wrap the JSON in text or markdown.`;

async function getRuntime(req: NextRequest) {
  const userId = await resolveUserId();

  if (!userId) {
    console.error("[CopilotKit API] Unauthorized - No session found.");
    return null;
  }

  const user = await stackServerApp.getUser();
  console.log("[CopilotKit API] Authenticated user:", user?.primaryEmail, "ID:", userId);

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
  console.log("[CopilotKit API] POST request received");
  const runtime = await getRuntime(req);
  if (!runtime) return new Response("Unauthorized", { status: 401 });

  const handler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit",
  });

  return handler(req);
};

export const GET = async (req: NextRequest) => {
  console.log("[CopilotKit API] GET request received");
  const runtime = await getRuntime(req);
  if (!runtime) return new Response("Unauthorized", { status: 401 });

  const handler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit",
  });

  return handler(req);
};

