import { mastra } from "@/mastra";
import { stack } from "@/lib/stack";
import { MASTRA_RESOURCE_ID_KEY, MASTRA_THREAD_ID_KEY, RequestContext } from "@mastra/core/request-context";
import { createAssistantResponse } from "assistant-stream";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, threadId: requestedThreadId } = await req.json();
  const user = await stack.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user.id;
  const threadId = requestedThreadId || crypto.randomUUID();

  // Initialize request context for Mastra tools
  const requestContext = new RequestContext();
  requestContext.set("userId", userId);
  requestContext.set(MASTRA_RESOURCE_ID_KEY, userId);
  requestContext.set(MASTRA_THREAD_ID_KEY, threadId);

  const agent = mastra.getAgent("debo");

  // Fetch active Composio toolkits for this user
  const { getComposioActiveApps } = await import("@/actions/composio");
  const activeApps = await getComposioActiveApps();
  const toolkits = activeApps.map((app) => app.slug);

  let dynamicTools = {};
  if (toolkits.length > 0) {
    const { getComposioTools } = await import("@/mastra/tools/composio-tools");
    dynamicTools = await getComposioTools(userId, toolkits);
    console.log(`[Chat] Injecting dynamic tools for: ${toolkits.join(", ")}`);
  }

  return createAssistantResponse(async ({ forwardStream }) => {
    const result = await agent.stream(messages, {
      memory: {
        threadId,
        resourceId: userId,
      },
      tools: {
        ...agent.tools,
        ...dynamicTools,
      },
      requestContext,
      onStepFinish: (step) => {
        console.log(`[Chat] Step finished: ${step.stepType}`);
      },
    });

    await forwardStream(result.toDataStream());
  });
}
