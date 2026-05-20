import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const runtime = "nodejs";

// NVIDIA NIM API config — OpenAI-compatible endpoint
const NVIDIA_API_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || "";

// Model selection: use the best available NVIDIA-hosted model
const ANSWER_MODEL = process.env.NVIDIA_ANSWER_MODEL || "nvidia/llama-3.1-nemotron-70b-instruct";
const FAST_MODEL = process.env.NVIDIA_FAST_MODEL || "meta/llama-3.3-70b-instruct";

/**
 * Build a system prompt with memory context from the user's stored sources.
 */
function buildSystemPrompt(contextText: string, mode: string): string {
  const parts = [
    `You are Debo, a private AI memory assistant. You help users recall and understand their stored memories.`,
    `Rules:\n- Answer using ONLY the user's stored memory context below.\n- If a source exists, cite it by title and type (e.g., "Journal: Daily Reflection").\n- If no relevant memory is found, say "I don't have any stored memory about that."\n- Never invent or hallucinate memory.\n- Be concise and direct.\n- Use markdown formatting for readability.`,
  ];

  if (mode === "summarize") {
    parts.push("The user wants a summary. Synthesize the memory context into a clear overview.");
  } else if (mode === "plan") {
    parts.push("The user wants planning help. Use memory context to suggest next steps.");
  }

  if (contextText.trim()) {
    parts.push(`\n--- USER'S MEMORY CONTEXT ---\n${contextText}\n--- END CONTEXT ---`);
  } else {
    parts.push("\nNo relevant memory found for this question.");
  }

  return parts.join("\n\n");
}

/**
 * Retrieve relevant sources from the user's DB as context for the LLM.
 * Simple text search for now — will be upgraded to vector search later.
 */
async function getMemoryContext(userId: string, question: string): Promise<{
  contextText: string;
  sourcesFound: Array<{ id: string; type: string; title: string; snippet: string }>;
}> {
  // Get the user's most recent sources as context
  const recentSources = await db
    .select({
      id: sources.id,
      type: sources.type,
      title: sources.title,
      plainText: sources.plainText,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .where(eq(sources.userId, userId))
    .orderBy(desc(sources.createdAt))
    .limit(10);

  const sourcesFound = recentSources
    .filter((s) => s.plainText)
    .map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title ?? "Untitled",
      snippet: (s.plainText ?? "").slice(0, 300),
    }));

  const contextText = sourcesFound
    .map((s, i) => `[Source ${i + 1}: ${s.type} — "${s.title}"]\n${s.snippet}`)
    .join("\n\n");

  return { contextText, sourcesFound };
}

/**
 * POST /api/ask — Ask Debo a question with streaming SSE response.
 * Uses NVIDIA NIM (OpenAI-compatible) for LLM inference.
 */
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
        // 1. Retrieve memory context
        send({ type: "retrieval_started" });
        const { contextText, sourcesFound } = await getMemoryContext(user.id, question);

        // 2. Send source_found events
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

        // 3. Build prompt and call NVIDIA NIM
        const systemPrompt = buildSystemPrompt(contextText, mode);

        // Check if NVIDIA API key is available
        if (!NVIDIA_API_KEY) {
          // Fallback: generate a contextual response without LLM
          const fallbackAnswer = sourcesFound.length > 0
            ? `Based on your ${sourcesFound.length} most recent memories, I found entries including: ${sourcesFound.map(s => `"${s.title}" (${s.type})`).join(", ")}. However, the AI service is not configured yet. Please add your NVIDIA_API_KEY to enable intelligent answers.`
            : "I don't have any stored memories yet. Start by creating journal entries, voice notes, or connecting apps. Also, please configure NVIDIA_API_KEY for AI-powered answers.";

          for (const word of fallbackAnswer.split(" ")) {
            send({ type: "answer_delta", token: word + " " });
          }

          send({
            type: "done",
            answer: fallbackAnswer,
            sources: sourcesFound,
            confidence: sourcesFound.length > 0 ? 0.3 : 0.1,
          });
          controller.close();
          return;
        }

        // 4. Stream from NVIDIA NIM
        const llmResponse = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
          },
          body: JSON.stringify({
            model: ANSWER_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            stream: true,
          }),
        });

        if (!llmResponse.ok) {
          const errText = await llmResponse.text();
          console.error("[ask] NVIDIA API error:", llmResponse.status, errText);
          send({ type: "answer_delta", token: "Sorry, I had trouble thinking about that. Please try again." });
          send({ type: "done", answer: "", sources: sourcesFound, confidence: 0.1 });
          controller.close();
          return;
        }

        // 5. Parse SSE stream from NVIDIA and forward answer tokens
        const reader = llmResponse.body?.getReader();
        if (!reader) {
          send({ type: "answer_delta", token: "Error: No response from AI service." });
          send({ type: "done", answer: "", sources: sourcesFound, confidence: 0.1 });
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullAnswer = "";

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
                fullAnswer += delta;
                send({ type: "answer_delta", token: delta });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        // 6. Send done event with final payload
        send({
          type: "done",
          answer: fullAnswer,
          sources: sourcesFound,
          confidence: sourcesFound.length > 0 ? 0.75 : 0.2,
          followUps: [
            "What tasks are pending from this?",
            "Summarize my recent entries",
          ],
        });
      } catch (err) {
        console.error("[ask] pipeline error:", err);
        send({
          type: "answer_delta",
          token: "Something went wrong. Please try again.",
        });
        send({ type: "done", answer: "", confidence: 0.1 });
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
