import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";
import { client, DEFAULT_CHAT_MODEL } from "@/lib/ai/openai";
import { getAgentTools } from "@/lib/ai/agent-tools";

const DEBO_AGENT_PROMPT = `You are Debo, the user's private AI companion journal.

Debo turns life entries into queryable memory. Be warm, concise, and evidence-backed. Use the available tools aggressively when the user asks about journals, memories, timeline events, recurring patterns, or durable facts. Never invent life details, dates, or citations.

When useful, render structured results with render_journal_card, render_timeline_item, or render_insight_summary. Prefer concrete dates, short summaries, and useful next actions over generic advice.

IMPORTANT: When you decide to use a tool, use the tool calling API. Do not wrap the JSON in text or markdown.`;

export const POST = async (req: NextRequest) => {
  console.log("[CopilotKit API] POST request received");
  const user = await stackServerApp.getUser();

  if (!user) {
    console.error("[CopilotKit API] Unauthorized - No session found.");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("[CopilotKit API] Authenticated user:", user.primaryEmail, "ID:", user.id);

  try {
    const runtime = new CopilotRuntime({
      actions: getAgentTools(user.id),
    });

    const serviceAdapter = new OpenAIAdapter({
      openai: client as any,
      model: DEFAULT_CHAT_MODEL,
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });

    return await handleRequest(req);
  } catch (error: any) {
    console.error("[CopilotKit API] Runtime Error:", error);
    return new Response(error.message || "Internal Server Error", { status: error.status || 500 });
  }
};

