import { mastra } from "@/mastra";
import { stackServerApp } from "@/stack/server";
import { MASTRA_RESOURCE_ID_KEY, MASTRA_THREAD_ID_KEY, RequestContext } from "@mastra/core/request-context";
import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";

export const maxDuration = 30;

function extractLatestUserText(messages: any[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message?.role === "user");
  if (!latestUserMessage) return "";

  if (typeof latestUserMessage.content === "string") return latestUserMessage.content;
  if (typeof latestUserMessage.text === "string") return latestUserMessage.text;

  const parts = Array.isArray(latestUserMessage.parts) ? latestUserMessage.parts : [];
  return parts
    .map((part: any) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" && typeof part.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldLoadMemoryContext(text: string) {
  const normalized = text.trim();
  if (normalized.length < 3) return false;
  return !/^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|k|test)[!.?\s]*$/i.test(normalized);
}

async function buildMemoryContext(userId: string, messages: any[]) {
  const latestText = extractLatestUserText(messages);
  if (!shouldLoadMemoryContext(latestText)) return null;

  try {
    const { getMemories } = await import("@/actions/memories");
    const result = await getMemories(latestText, 8, 0, userId);
    if (!result.success || !result.data?.length) return null;

    return [
      "Relevant memories from /dashboard/memories:",
      ...result.data.map((memory) => `- ${memory.content}`),
      "Use these only as context. Do not say you checked a tool unless asked.",
    ].join("\n");
  } catch (error) {
    console.warn("[Chat] Memory context unavailable:", error);
    return null;
  }
}

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

  const memoryContext = await buildMemoryContext(userId, messages);
  if (memoryContext) {
    requestContext.set("memoryContext", memoryContext);
  }

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

  const stream = await handleChatStream({
    mastra,
    agentId: "debo",
    version: "v6",
    params: {
      messages: memoryContext
        ? [
            {
              id: "debo-memory-context",
              role: "system",
              parts: [{ type: "text", text: memoryContext }],
            },
            ...messages,
          ]
        : messages,
      memory: {
        thread: { id: threadId },
        resource: userId,
      },
      toolsets: Object.keys(dynamicTools).length > 0 ? { composio: dynamicTools } : undefined,
      requestContext,
    } as any,
  });

  return createUIMessageStreamResponse({ stream });
}
