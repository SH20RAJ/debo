/**
 * generate-answer.node.ts — Calls NVIDIA NIM to generate a source-backed answer.
 * Uses OpenAI-compatible streaming API for NVIDIA hosted models.
 */

import { ChatOpenAI } from "@langchain/openai";
import type { SourceFound, Citation } from "../schemas/answer.schema";

// NVIDIA NIM — OpenAI-compatible endpoint
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || "";
const ANSWER_MODEL = process.env.NVIDIA_ANSWER_MODEL || "nvidia/llama-3.1-nemotron-70b-instruct";

/**
 * Create a LangChain ChatOpenAI instance configured for NVIDIA NIM.
 */
export function createNvidiaLLM(streaming = true) {
  return new ChatOpenAI({
    model: ANSWER_MODEL,
    temperature: 0.3,
    maxTokens: 1024,
    streaming,
    configuration: {
      baseURL: NVIDIA_BASE_URL,
      apiKey: NVIDIA_API_KEY,
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
