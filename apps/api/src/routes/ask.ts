import "dotenv/config";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { getAppContext } from "../lib/context";
import { getRelevantContext, buildCitation } from "@debo/memory";
import type { Citation } from "@debo/memory";

const app = new Hono();

const NVIDIA_API_URL =
  process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct";

// ─── Intent classification prompt fragments ──────────────────────────────────

const INTENT_KEYWORDS: Record<string, string[]> = {
  memory_recall: ["what did", "remember", "did i", "what was", "recall", "what happened"],
  source_summary: ["summarize", "summary", "overview", "all my"],
  task_search: ["task", "todo", "to-do", "deadline", "due", "remind"],
  person_search: ["who is", "person", "contact", "people", "someone"],
  project_search: ["project", "initiative", "working on"],
  planning: ["plan", "strategy", "next steps", "roadmap"],
  draft: ["draft", "write", "compose", "email"],
};

function classifyIntent(question: string): string {
  const lower = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return "memory_recall";
}

// ─── System prompt builder ───────────────────────────────────────────────────

function buildSystemPrompt(
  contextText: string,
  mode: string,
  intent: string
): string {
  const parts: string[] = [];

  parts.push(
    `You are Debo, a private memory assistant. You answer questions using ONLY the user's stored memory context below.`
  );
  parts.push(
    `Rules:\n- If a source exists, cite it by title and type.\n- If the source is weak or uncertain, say so.\n- If no relevant memory is found, say "I don't have any stored memory about that."\n- Never invent or hallucinate memory.\n- Separate memory-backed facts from general reasoning.\n- Prefer concise, direct answers.\n- When citing, mention the source title and type (e.g., "Voice note: Marketing Sync").`
  );

  if (mode === "summarize") {
    parts.push(`The user wants a summary. Synthesize the memory context into a clear overview.`);
  } else if (mode === "plan") {
    parts.push(`The user wants planning help. Use memory context to suggest next steps.`);
  } else if (mode === "draft") {
    parts.push(`The user wants help drafting something. Use memory context for facts and tone.`);
  }

  parts.push(`Detected intent: ${intent}`);

  if (contextText.trim()) {
    parts.push(`\n--- MEMORY CONTEXT ---\n${contextText}\n--- END CONTEXT ---`);
  } else {
    parts.push(`\nNo relevant memory found for this question.`);
  }

  return parts.join("\n\n");
}

// ─── Confidence scorer ──────────────────────────────────────────────────────

function computeConfidence(
  chunks: { relevanceScore: number }[],
  answer: string
): number {
  if (chunks.length === 0) return 0.1;
  if (answer.toLowerCase().includes("don't have any stored memory"))
    return 0.1;

  const avgRelevance =
    chunks.reduce((sum, c) => sum + c.relevanceScore, 0) / chunks.length;
  const coverageBonus = Math.min(chunks.length / 5, 1) * 0.15;
  return Math.min(0.95, avgRelevance * 0.7 + coverageBonus + 0.1);
}

// ─── POST / ──────────────────────────────────────────────────────────────────

app.post("/", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();

  const question: string = (body.question || "").trim();
  if (!question) {
    return c.json({ error: "question is required" }, 400);
  }

  const mode: string = body.mode || "recall";
  const threadId: string | undefined = body.threadId;
  const filters = body.filters || {};
  const intent = classifyIntent(question);

  // 1. Retrieve memory context
  const context = await getRelevantContext(ctx.userId, question, 8);

  // 2. Apply source type filters if provided
  let filteredChunks = context.chunks;
  if (filters.sourceTypes && Array.isArray(filters.sourceTypes)) {
    filteredChunks = context.chunks.filter((ch) =>
      filters.sourceTypes.includes(ch.sourceType)
    );
  }

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(context.contextText, mode, intent);

  // 4. Call NVIDIA NIM (streaming)
  let answer = "";

  try {
    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.3,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[ask] NVIDIA API error:", response.status, errBody);
      return c.json(
        { error: "LLM request failed", detail: errBody },
        502
      );
    }

    // Stream SSE from NVIDIA and collect the full answer
    const reader = response.body?.getReader();
    if (!reader) {
      return c.json({ error: "No response body" }, 502);
    }

    const decoder = new TextDecoder();
    let buffer = "";

    // Set up SSE response to client
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    return stream(c, async (streamWriter) => {
      // Send retrieval_started event
      await streamWriter.write(
        `data: ${JSON.stringify({ event: "retrieval_started", chunks: filteredChunks.length })}\n\n`
      );

      // Send source_found events
      for (const chunk of filteredChunks) {
        await streamWriter.write(
          `data: ${JSON.stringify({ event: "source_found", sourceType: chunk.sourceType, title: chunk.title, snippet: chunk.content.slice(0, 200) })}\n\n`
        );
      }

      // Stream answer tokens
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                answer += delta;
                await streamWriter.write(
                  `data: ${JSON.stringify({ event: "answer_delta", delta })}\n\n`
                );
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }
      } catch (err) {
        console.error("[ask] stream read error:", err);
      }

      // 5. Build citations from chunks used
      const citations: Citation[] = filteredChunks.map((chunk) =>
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
        })
      );

      // Send citation events
      for (const cit of citations) {
        await streamWriter.write(
          `data: ${JSON.stringify({ event: "citation_added", citation: { id: cit.id, sourceId: cit.sourceId, sourceType: cit.sourceType, title: cit.title, snippet: cit.snippet, pageNumber: cit.pageNumber, timestamp: cit.timestamp } })}\n\n`
        );
      }

      // 6. Compute confidence
      const confidence = computeConfidence(filteredChunks, answer);

      // 7. Send done event with final payload
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
          confidence,
          threadId: threadId || null,
          intent,
          mode,
          userId: ctx.userId,
          createdAt: new Date().toISOString(),
        })}\n\n`
      );
    });
  } catch (err) {
    console.error("[ask] pipeline error:", err);
    return c.json({ error: "Ask Debo pipeline failed" }, 500);
  }
});

export default app;
