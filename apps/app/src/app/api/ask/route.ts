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
import { classifyIntent } from "@/server/langgraph/nodes/classify-intent.node";
import { retrieveMemory } from "@/server/langgraph/nodes/retrieve-memory.node";
import {
  createNvidiaLLM,
  buildSystemPrompt,
  buildCitations,
  computeConfidenceLabel,
} from "@/server/langgraph/nodes/generate-answer.node";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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
        // 1. Classify intent (cheap, no LLM)
        const intent = classifyIntent(question);

        // 2. Retrieve memory from DB
        send({ type: "retrieval_started" });
        const { sourcesFound, contextText } = await retrieveMemory(user.id, question, 10);

        // 3. Emit source_found events for each source
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

        // 4. Generate answer — stream tokens from NVIDIA NIM
        const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

        let fullAnswer = "";

        if (!apiKey) {
          // Fallback when no API key configured
          fullAnswer = sourcesFound.length > 0
            ? `I found ${sourcesFound.length} relevant memories: ${sourcesFound.map(s => `"${s.title}"`).join(", ")}. Configure NVIDIA_API_KEY for AI answers.`
            : "No stored memories yet. Start capturing content and set NVIDIA_API_KEY for AI answers.";

          for (const word of fullAnswer.split(" ")) {
            send({ type: "answer_delta", token: word + " " });
          }
        } else {
          // Stream from NVIDIA NIM via LangChain
          const llm = createNvidiaLLM(true);
          const systemPrompt = buildSystemPrompt(contextText, mode, intent);

          const stream = await llm.stream([
            new SystemMessage(systemPrompt),
            new HumanMessage(question),
          ]);

          for await (const chunk of stream) {
            const token = typeof chunk.content === "string" ? chunk.content : "";
            if (token) {
              fullAnswer += token;
              send({ type: "answer_delta", token });
            }
          }
        }

        // 5. Build citations + confidence
        const citations = buildCitations(sourcesFound);
        const confidence = computeConfidenceLabel(sourcesFound, fullAnswer);

        // 6. Send done event
        send({
          type: "done",
          answer: fullAnswer,
          sources: sourcesFound,
          citations,
          confidence,
          intent,
          followUps: [
            "What tasks are pending from this?",
            "Summarize my recent entries",
          ],
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
