import { mastra } from "@/mastra";
import { stackServerApp } from "@/stack/server";
import { MASTRA_RESOURCE_ID_KEY, MASTRA_THREAD_ID_KEY, RequestContext } from "@mastra/core/request-context";
import { handleChatStream } from "@mastra/ai-sdk";
import { createAssistantStreamResponse } from "assistant-stream";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, threadId: requestedThreadId } = (await req.json()) as {
    messages: any[];
    threadId?: string;
  };

  const user = await stackServerApp.getUser();
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

  // Dynamically inject Composio tools (with graceful error handling)
  let dynamicTools: Record<string, any> = {};
  try {
    const { getComposioActiveApps } = await import("@/actions/composio");
    const activeApps = await getComposioActiveApps();
    const toolkits = activeApps.map((app) => app.slug);

    if (toolkits.length > 0) {
      const { getComposioTools } = await import("@/mastra/tools/composio-tools");
      dynamicTools = await getComposioTools(userId, toolkits);
      const toolCount = Object.keys(dynamicTools).length;
      if (toolCount > 0) {
        console.log(`[Chat] Loaded ${toolCount} Composio tools for: ${toolkits.join(", ")}`);
      } else {
        console.warn(`[Chat] No tools loaded for: ${toolkits.join(", ")}`);
      }
    }
  } catch (error) {
    // Composio tool loading failed — continue without external tools
    console.warn("[Chat] Composio tools unavailable, continuing without them:", error);
  }

  return createAssistantStreamResponse(async (controller) => {
    const stream = await handleChatStream({
      mastra,
      agentId: "debo",
      version: "v6",
      params: {
        messages,
        memory: {
          thread: { id: threadId },
          resource: userId,
        },
        toolsets: Object.keys(dynamicTools).length > 0 ? { composio: dynamicTools } : undefined,
        requestContext,
      } as any,
    });

    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const part = value as any;
      
      // Map AI SDK parts to assistant-stream chunks
      switch (part.type) {
        case "text-delta":
          controller.appendText(part.delta);
          break;
        case "tool-call":
          controller.addToolCallPart({
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            args: part.args,
          });
          break;
        case "error":
          console.error("[Chat] Stream part error:", part.error || part.errorText);
          break;
      }
    }
  });
}
