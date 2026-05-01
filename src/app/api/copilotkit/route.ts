import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { getChatModel } from "@/lib/ai/openai";
import { getAgentTools } from "@/lib/ai/agent-tools";

const serviceAdapter = new ExperimentalEmptyAdapter();

const DEBO_AGENT_PROMPT = `You are Debo, the user's private AI companion journal.

Debo turns life entries into queryable memory. Be warm, concise, and evidence-backed. Use the available tools aggressively when the user asks about journals, memories, timeline events, recurring patterns, or durable facts. Never invent life details, dates, or citations.

When useful, render structured results with render_journal_card, render_timeline_item, or render_insight_summary. Prefer concrete dates, short summaries, and useful next actions over generic advice.`;

export const POST = async (req: NextRequest) => {
  const user = await stackServerApp.getUser();

  if (!user) {
    console.error("[CopilotKit API] Unauthorized - No session found.");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("[CopilotKit API] Authenticated user:", user.primaryEmail);

  const runtime = new CopilotRuntime({
    agents: {
      default: new BuiltInAgent({
        model: getChatModel(),
        prompt: DEBO_AGENT_PROMPT,
        maxSteps: 5,
        temperature: 0.35,
      }),
    },
    actions: getAgentTools(user.id),
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
