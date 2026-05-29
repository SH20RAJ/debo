/**
 * generate-answer.node.ts — Streams a source-backed answer.
 * Uses OpenAI-compatible API; auto-detects NVIDIA NIM vs OpenAI by base URL.
 */

import { ChatOpenAI } from "@langchain/openai";
import type { SourceFound, Citation } from "../schemas/answer.schema";

function pickConfig() {
  // Prefer explicit overrides; otherwise auto-detect from base URL.
  const baseURL =
    process.env.NVIDIA_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    "https://api.openai.com/v1";
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";
  const isNvidia = baseURL.includes("nvidia.com");
  const model =
    process.env.NVIDIA_ANSWER_MODEL ||
    process.env.DEBO_ANSWER_MODEL ||
    (isNvidia
      ? "meta/llama-3.3-70b-instruct"
      : "gpt-4o-mini");
  return { baseURL, apiKey, model };
}

/**
 * Create a LangChain ChatOpenAI instance.
 */
export function createNvidiaLLM(streaming = true) {
  const { baseURL, apiKey, model } = pickConfig();
  return new ChatOpenAI({
    model,
    temperature: 0.3,
    maxTokens: 1024,
    streaming,
    configuration: {
      baseURL,
      apiKey,
    },
  });
}

/**
 * Build the system prompt with memory context and rules.
 */
export function buildSystemPrompt(
  contextText: string,
  mode: string,
  intent: string
): string {
  const parts = [
    `You are Debo, a private AI memory assistant. You answer using ONLY the user's stored memory context below.`,
    `Rules:\n- Cite sources by title and type (e.g., "Journal: Daily Reflection").\n- If no relevant memory, say "I don't have any stored memory about that."\n- Never invent or hallucinate memory.\n- Be concise. Use markdown for readability.\n- Separate memory-backed facts from reasoning.`,
  ];

  if (mode === "summarize") parts.push("Synthesize memory into a clear overview.");
  if (mode === "plan") parts.push("Use memory context to suggest next steps.");
  if (mode === "draft") parts.push("Use memory context for facts and tone.");

  parts.push(`Intent: ${intent}`);

  if (contextText.trim()) {
    parts.push(`\n--- MEMORY CONTEXT ---\n${contextText}\n--- END ---`);
  } else {
    parts.push("\nNo relevant memory found for this question.");
  }

  return parts.join("\n\n");
}

/**
 * Build citation objects from the sources used in the answer.
 */
export function buildCitations(sourcesFound: SourceFound[]): Citation[] {
  return sourcesFound.map((s) => ({
    id: `cit_${s.id}`,
    sourceId: s.id,
    sourceType: s.type,
    title: s.title,
    snippet: s.snippet.slice(0, 200),
    confidence: "partial" as const,
    relevanceScore: 0.7,
    timestamp: s.createdAt,
  }));
}

/**
 * Determine overall confidence label based on sources.
 */
export function computeConfidenceLabel(
  sourcesFound: SourceFound[],
  answer: string
): "strong_source_match" | "partial_source_match" | "weak_source_match" | "no_source_found" {
  if (sourcesFound.length === 0) return "no_source_found";
  if (answer.toLowerCase().includes("don't have any stored memory")) return "no_source_found";
  if (sourcesFound.length >= 3) return "strong_source_match";
  if (sourcesFound.length >= 1) return "partial_source_match";
  return "weak_source_match";
}
