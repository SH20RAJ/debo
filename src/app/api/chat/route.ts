import { mastra } from "@/mastra";
import { resolveUserId } from "@/actions/auth-sync";
import { handleChatStream } from "@mastra/ai-sdk";
import { RequestContext } from "@mastra/core/request-context";
import { createUIMessageStreamResponse } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let userId = "anonymous";
  let authenticatedUserId: string | undefined;
  try {
    const resolvedId = await resolveUserId();
    if (resolvedId) {
      userId = resolvedId;
      authenticatedUserId = resolvedId;
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
    let requestContext: RequestContext<{ userId: string }> | undefined;
    if (authenticatedUserId) {
      requestContext = new RequestContext<{ userId: string }>();
      requestContext.set("userId", authenticatedUserId);
    }

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
        requestContext,
        maxSteps: 4,
      },
    });

    // Transform stream to map sub-agent cumulative text to standard text-delta
    // This makes sub-agent responses visible as streaming text in standard UI components
    const lastTexts: Record<string, string> = {};
    const syntheticTextPartIds: Record<string, string> = {};
    const endedTextPartIds = new Set<string>();
    const closeSyntheticTextParts = (controller: TransformStreamDefaultController) => {
      for (const textPartId of Object.values(syntheticTextPartIds)) {
        if (!endedTextPartIds.has(textPartId)) {
          controller.enqueue({
            type: "text-end",
            id: textPartId,
          });
          endedTextPartIds.add(textPartId);
        }
      }
    };

    const transformedStream = stream.pipeThrough(new TransformStream({
      transform(value, controller) {
        if (!value) return;

        // Handle sub-agent streaming text
        if (value.type === "data-tool-agent" && value.data && typeof value.data === 'object') {
          const agentId = (value.data as any).id;
          const runId = typeof value.id === 'string' ? value.id : agentId;
          const fullText = (value.data as any).text;
          
          if (runId && typeof fullText === 'string') {
            const lastText = lastTexts[runId] || "";
            const delta = fullText.slice(lastText.length);
            
            if (delta) {
              const textPartId = syntheticTextPartIds[runId] ?? `sub-agent-${runId}`;
              syntheticTextPartIds[runId] = textPartId;

              if (!lastText) {
                controller.enqueue({
                  type: "text-start",
                  id: textPartId,
                });
              }

              // Emit as text-delta so standard UI components render it.
              // AI SDK v6 requires deltas to reference an existing text part id.
              controller.enqueue({
                type: "text-delta",
                id: textPartId,
                delta,
              });
            }
            lastTexts[runId] = fullText;
          }
        }

        if (value.type === "finish") {
          closeSyntheticTextParts(controller);
        }

        controller.enqueue(value);
      },
      flush(controller) {
        closeSyntheticTextParts(controller);
      },
    }));

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
