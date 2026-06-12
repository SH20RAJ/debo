/**
 * generate-answer.node.ts — Streams an answer.
 * Provider (NVIDIA vs OpenAI) is resolved once in @/server/llm/provider so
 * the key and endpoint can never mismatch.
 */

import { ChatOpenAI } from "@langchain/openai";
import type { SourceFound, Citation } from "../schemas/answer.schema";
import { resolveProvider } from "@/server/llm/provider";

/**
 * Create a LangChain ChatOpenAI instance. Returns null when no LLM is configured.
 */
export function createNvidiaLLM(streaming = true): ChatOpenAI | null {
  const cfg = resolveProvider();
  if (!cfg) return null;
  return new ChatOpenAI({
    model: cfg.chatModel,
    temperature: 0.4,
    maxTokens: 1024,
    streaming,
    apiKey: cfg.apiKey,
    configuration: {
      baseURL: cfg.baseURL,
      apiKey: cfg.apiKey,
    },
  });
}

/**
 * Build the system prompt. For chitchat we drop the memory-only rules and let
 * Debo just talk; for everything else we stay strictly source-backed.
 */
export function buildSystemPrompt(
  contextText: string,
  mode: string,
  intent: string
): string {
  if (intent === "chitchat") {
    return [
      `You are Debo, a warm, private AI memory companion.`,
      `The user is just chatting (a greeting, thanks, or small talk) — respond naturally and briefly, like a friendly human.`,
      `Do NOT mention searching memory, sources, or "stored memory" unless the user asks about their past.`,
      `If it fits, gently remind them you can capture notes, voice, and answer questions about their past — but keep it to one short sentence and don't force it.`,
      `Keep it to 1-2 sentences. No markdown headers.`,
    ].join("\n");
  }

  const parts = [
    `You are Debo, a private AI memory assistant. You answer using the user's stored memory context below or by calling external tools.`,
    `Rules:\n- Cite sources by title and type (e.g., "Journal: Daily Reflection" or "Gmail: Inbox").\n- You have access to external tools (Gmail, Slack, Notion, Tasks, and custom MCPs). If the memory context below does not contain the answer, or if the user asks you to check external accounts/mails/tasks, call the appropriate tools to fetch the information.\n- If no relevant memory exists and no tools provide the answer, say so plainly and offer to help capture it — do not invent memory.\n- Be concise. Use markdown for readability.\n- Separate memory-backed facts from your own reasoning.`,
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
