import { 
  CopilotRuntime, 
  OpenAIAdapter, 
  copilotRuntimeNextJSAppRouterEndpoint 
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOpenAIClient } from "@/lib/ai/openai";

import { getAgentTools } from "@/lib/ai/agent-tools";

const serviceAdapter = new OpenAIAdapter({
  openai: getOpenAIClient() as any,
});

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const runtime = new CopilotRuntime({
    actions: getAgentTools(session.user.id),
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
