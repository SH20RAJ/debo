/**
 * POST /api/ask — Ask Debo a question.
 *
 * Pipeline: classify intent → retrieve memory → stream LLM answer → cite sources.
 *
 * Streams Server-Sent Events back to the client:
 *   - retrieval_started
 *   - source_found (one per retrieved source)
 *   - answer_delta (real LLM tokens, not fake word splits)
 *   - done (final payload with citations + confidence + suggestions)
 *
 * Auth + workspace are required. The graph is also still callable as a
 * single invoke from server-side code (see askDebo()) for tests/cron jobs.
 */

import { NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { requireSession, apiError } from "@/lib/api-helpers";
import { classifyIntent } from "@/server/langgraph/nodes/classify-intent.node";
import { retrieveMemory } from "@/server/langgraph/nodes/retrieve-memory.node";
import {
  buildSystemPrompt,
  buildCitations,
  computeConfidenceLabel,
  createNvidiaLLM,
} from "@/server/langgraph/nodes/generate-answer.node";
import { suggestActionsNode } from "@/server/langgraph/nodes/suggest-actions.node";
import { validateCitationsNode } from "@/server/langgraph/nodes/validate-citations.node";
import { db } from "@debo/db";
import {
  chatThreads,
  chatMessages,
  answerCitations,
  auditLogs,
} from "@debo/db/schema";
import { eq, and } from "drizzle-orm";
import { newId } from "@/lib/api-helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: { question?: string; mode?: string; threadId?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("invalid_json", 400);
  }

  const question = (body.question ?? "").trim();
  if (!question) return apiError("question_required", 400);

  const mode = body.mode ?? "recall";
  const apiKey = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY;

  // Resolve or create the chat thread we attribute this turn to. We don't
  // require it client-side; create-on-demand is fine for now.
  let threadId = body.threadId;
  if (!threadId) {
    threadId = newId("thr");
    await db.insert(chatThreads).values({
      id: threadId,
      userId: user.id,
      workspaceId,
      mode: ["recall", "summarize", "plan", "draft", "task", "project"].includes(mode)
        ? (mode as "recall" | "summarize" | "plan" | "draft" | "task" | "project")
        : "recall",
      title: question.slice(0, 80),
    });
  } else {
    // Confirm ownership; if not found, create-on-demand instead of leaking
    const [existing] = await db
      .select({ id: chatThreads.id })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, user.id),
        ),
      )
      .limit(1);
    if (!existing) {
      threadId = newId("thr");
      await db.insert(chatThreads).values({
        id: threadId,
        userId: user.id,
        workspaceId,
        mode: "recall",
        title: question.slice(0, 80),
      });
    }
  }

  const userMessageId = newId("msg");
  await db.insert(chatMessages).values({
    id: userMessageId,
    userId: user.id,
    workspaceId,
    threadId,
    role: "user",
    content: question,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "retrieval_started" });

        const intent = classifyIntent(question);
        const { sourcesFound, contextText } = await retrieveMemory(
          user.id,
          question,
          8,
        );

        for (const src of sourcesFound) {
          send({
            type: "source_found",
            id: src.id,
            sourceType: src.type,
            title: src.title,
            snippet: src.snippet,
            confidence: "partial",
          });
        }

        let finalAnswer = "";

        if (!apiKey) {
          // Service degraded but transparent: tell the client + log it.
          finalAnswer =
            sourcesFound.length > 0
              ? `I found ${sourcesFound.length} relevant memories: ${sourcesFound
                  .map((s) => `"${s.title}"`)
                  .join(", ")}. Configure OPENAI_API_KEY (or NVIDIA_API_KEY) to enable AI answers.`
              : "No stored memories found yet. Capture journals, voice notes, or connect apps to start. Configure OPENAI_API_KEY to enable AI answers.";
          send({ type: "answer_delta", token: finalAnswer });
        } else {
          const llm = createNvidiaLLM(true);
          const systemPrompt = buildSystemPrompt(contextText, mode, intent);
          const tokenStream = await llm.stream([
            new SystemMessage(systemPrompt),
            new HumanMessage(question),
          ]);
          for await (const chunk of tokenStream) {
            const token = typeof chunk.content === "string" ? chunk.content : "";
            if (token) {
              finalAnswer += token;
              send({ type: "answer_delta", token });
            }
          }
        }

        const citations = buildCitations(sourcesFound);
        const confidence = computeConfidenceLabel(sourcesFound, finalAnswer);

        // Run the post-answer LangGraph nodes. They are pure synchronous
        // helpers; we call them inline here for streaming control.
        const validation = validateCitationsNode({
          citations,
          sourcesFound,
        });
        const filteredCitations = validation.citations;
        const { actionSuggestions, followUps } = suggestActionsNode({
          intent,
          answer: finalAnswer,
          sourcesFound,
        });

        const assistantMessageId = newId("msg");
        await db.insert(chatMessages).values({
          id: assistantMessageId,
          userId: user.id,
          workspaceId,
          threadId,
          role: "assistant",
          content: finalAnswer,
          metadataJson: JSON.stringify({ intent, mode, confidence }),
        });

        // Persist citations
        if (filteredCitations.length > 0) {
          await db.insert(answerCitations).values(
            filteredCitations.map((c) => ({
              id: newId("cit"),
              userId: user.id,
              workspaceId,
              messageId: assistantMessageId,
              sourceId: c.sourceId,
              quoteText: c.snippet ?? null,
              confidence: typeof c.relevanceScore === "number" ? c.relevanceScore : null,
            })),
          );
        }

        await db.insert(auditLogs).values({
          id: newId("audit"),
          userId: user.id,
          workspaceId,
          action: "ask.answer",
          targetType: "chat_message",
          targetId: assistantMessageId,
          ipAddress: req.headers.get("x-forwarded-for"),
          userAgent: req.headers.get("user-agent"),
          metadataJson: JSON.stringify({
            intent,
            mode,
            sourceCount: sourcesFound.length,
            confidence,
          }),
        });

        send({
          type: "done",
          threadId,
          messageId: assistantMessageId,
          answer: finalAnswer,
          sources: sourcesFound,
          citations: filteredCitations,
          confidence,
          intent,
          followUps,
          actionSuggestions,
          citationValidation: validation.citationValidation,
        });
      } catch (err) {
        console.error("[ask] pipeline error:", err);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "internal_error",
        });
        send({ type: "done", answer: "", confidence: "no_source_found" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
