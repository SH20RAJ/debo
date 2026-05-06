import { mastra } from "@/mastra";
import { resolveUserId } from "@/actions/auth-sync";
import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let userId = "anonymous";
  try {
    const resolvedId = await resolveUserId();
    if (resolvedId) {
      userId = resolvedId;
    }
  } catch (e) {
    console.error("DEBUG: Auth resolution failed, using fallback", e);
  }

  // Cloudflare context sync
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const cf = getCloudflareContext();
    if (cf?.env) {
      Object.assign(process.env, cf.env);
    }
  } catch {
    // Not on Cloudflare
  }

  try {
    const body = await req.json();
    const { id: threadId } = body as { id?: string };

    // Use the threadId from assistant-ui, fallback to a default
    const resolvedThreadId = threadId || "default";

    const stream = await handleChatStream({
      mastra,
      agentId: "debo",
      params: body as any,
      version: "v6",
      defaultOptions: {
        memory: {
          thread: resolvedThreadId,
          resource: userId,
        },
      },
    });

    // Transform stream to map sub-agent cumulative text to standard text-delta
    // This makes sub-agent responses visible as streaming text in standard UI components
    const lastTexts: Record<string, string> = {};
    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (!value) continue;

            // Handle sub-agent streaming text
            if (value.type === "data-tool-agent" && value.data && typeof value.data === 'object') {
              const agentId = (value.data as any).id;
              const fullText = (value.data as any).text;
              
              if (agentId && typeof fullText === 'string') {
                const lastText = lastTexts[agentId] || "";
                const delta = fullText.slice(lastText.length);
                
                if (delta) {
                  // Emit as text-delta so standard UI components render it
                  controller.enqueue({
                    type: "text-delta",
                    delta,
                  });
                }
                lastTexts[agentId] = fullText;
              }
            }

            controller.enqueue(value);
          }
        } catch (error) {
          console.error("STREAM_TRANSFORM_ERROR:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return createUIMessageStreamResponse({ stream: transformedStream });
  } catch (error) {
    console.error("CHAT_API_CRASH:", error);
    return new Response(
      JSON.stringify({
        error: "Intelligence engine error",
        message: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
