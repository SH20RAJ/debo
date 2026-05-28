/**
 * POST /api/ask — Ask Debo a question.
 *
 * Uses the LangGraph Ask Debo pipeline:
 *   classify intent → retrieve memory → generate answer → cite sources
 *
 * Streams SSE events to the frontend:
 *   retrieval_started → source_found → answer_delta → done
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { askDebo } from "@/server/langgraph/graphs/ask-debo.graph";

export async function POST(req: Request) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const question = (body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const mode = body.mode || "recall";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "retrieval_started" });
        const result = await askDebo(user.id, question, mode);

        for (const src of result.sourcesFound) {
          send({
            type: "source_found",
            id: src.id,
            sourceType: src.type,
            title: src.title,
            snippet: src.snippet,
            confidence: "partial",
          });
        }

        for (const word of result.answer.split(" ")) {
          if (word) send({ type: "answer_delta", token: `${word} ` });
        }

        send({
          type: "done",
          answer: result.answer,
          sources: result.sourcesFound,
          citations: result.citations,
          confidence: result.confidence,
          intent: result.intent,
          followUps: result.followUps,
          actionSuggestions: result.actionSuggestions,
          citationValidation: result.citationValidation,
        });
      } catch (err) {
        console.error("[ask] pipeline error:", err);
        send({ type: "answer_delta", token: "Something went wrong. Please try again." });
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
