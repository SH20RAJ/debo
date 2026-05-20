/**
 * Ask route — the core "Ask Debo" intelligence endpoint.
 *
 * Called internally by apps/api when it needs AI-powered answers.
 * Retrieves memory context, builds prompts, streams LLM response.
 */

import { Hono } from "hono";
import { stream } from "hono/streaming";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getRelevantContext, buildCitation } from "@debo/memory";
import type { Citation } from "@debo/memory";

const app = new Hono();

const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct";

const provider = createOpenAI({
  baseURL: OPENAI_BASE_URL,
  apiKey: OPENAI_API_KEY,
});

// ─── Confidence labels ─────────────────────────────────────────────────────

type ConfidenceLabel =
  | "strong_source_match"
  | "partial_source_match"
  | "weak_source_match"
  | "no_source_found";

function getConfidenceLabel(
  score: number,
  chunkCount: number,
): ConfidenceLabel {
  if (chunkCount === 0) return "no_source_found";
  if (score >= 0.7) return "strong_source_match";
  if (score >= 0.4) return "partial_source_match";
  return "weak_source_match";
}

// ─── System prompt builder ─────────────────────────────────────────────────

function buildSystemPrompt(contextText: string, mode: string): string {
  const parts: string[] = [];

  parts.push(
    `You are Debo, a private memory assistant. You answer questions using ONLY the user's stored memory context below.`,
  );
  parts.push(
    `Rules:\n- If a source exists, cite it by title and type.\n- If the source is weak or uncertain, say so.\n- If no relevant memory is found, say "I don't have any stored memory about that."\n- Never invent or hallucinate memory.\n- Separate memory-backed facts from general reasoning.\n- Prefer concise, direct answers.\n- When citing, mention the source title and type (e.g., "Voice note: Marketing Sync").`,
  );

  if (mode === "summarize") {
    parts.push(
      `The user wants a summary. Synthesize the memory context into a clear overview.`,
    );
  } else if (mode === "plan") {
    parts.push(
      `The user wants planning help. Use memory context to suggest next steps.`,
    );
  }

  if (contextText.trim()) {
    parts.push(
      `\n--- MEMORY CONTEXT ---\n${contextText}\n--- END CONTEXT ---`,
    );
  } else {
    parts.push(`\nNo relevant memory found for this question.`);
  }

  return parts.join("\n\n");
}

// ─── POST / ────────────────────────────────────────────────────────────────

app.post("/", async (c) => {
  const body = await c.req.json();

  const question: string = (body.question || "").trim();
  const userId: string = body.userId || "";
  const mode: string = body.mode || "recall";

  if (!question) {
    return c.json({ error: "question is required" }, 400);
  }
  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  // 1. Retrieve memory context (user-scoped)
  const context = await getRelevantContext(userId, question, 8);

  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt(context.contextText, mode);

  // 3. Stream LLM response via Vercel AI SDK
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  return stream(c, async (streamWriter) => {
    // Send retrieval metadata
    await streamWriter.write(
      `data: ${JSON.stringify({ event: "retrieval_done", chunks: context.chunks.length })}\n\n`,
    );

    let answer = "";

    try {
      const result = streamText({
        model: provider(MODEL),
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
        temperature: 0.3,
        maxOutputTokens: 1024,
      });

      for await (const delta of result.textStream) {
        answer += delta;
        await streamWriter.write(
          `data: ${JSON.stringify({ event: "answer_delta", delta })}\n\n`,
        );
      }
    } catch (err) {
      console.error("[agents/ask] LLM error:", err);
      answer = "I'm having trouble answering right now. Please try again.";
      await streamWriter.write(
        `data: ${JSON.stringify({ event: "answer_delta", delta: answer })}\n\n`,
      );
    }

    // 4. Build citations
    const citations: Citation[] = context.chunks.map((chunk) =>
      buildCitation({
        chunkId: chunk.chunkId,
        sourceId: chunk.sourceId,
        content: chunk.content,
        sourceType: chunk.sourceType,
        title: chunk.title,
        heading: chunk.heading,
        timestamp: chunk.timestamp,
        pageNumber: chunk.pageNumber,
        relevanceScore: chunk.relevanceScore,
      }),
    );

    // 5. Compute confidence
    const avgRelevance =
      context.chunks.length > 0
        ? context.chunks.reduce((sum, c) => sum + c.relevanceScore, 0) /
          context.chunks.length
        : 0;
    const confidenceLabel = getConfidenceLabel(
      avgRelevance,
      context.chunks.length,
    );

    // 6. Send done event
    await streamWriter.write(
      `data: ${JSON.stringify({
        event: "done",
        answer,
        citations: citations.map((cit) => ({
          id: cit.id,
          sourceId: cit.sourceId,
          sourceType: cit.sourceType,
          title: cit.title,
          snippet: cit.snippet,
          pageNumber: cit.pageNumber,
          timestamp: cit.timestamp,
          relevanceScore: cit.relevanceScore,
        })),
        confidence: avgRelevance,
        confidenceLabel,
      })}\n\n`,
    );
  });
});

export default app;
