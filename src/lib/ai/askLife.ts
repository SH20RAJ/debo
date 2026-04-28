import "server-only";

import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { buildRetrievedContext } from "@/lib/ai/context";
import { getChatModel } from "@/lib/ai/openai";
import { createTools } from "@/lib/ai/tools";
import type { CitationSource } from "@/lib/vector/search";

type RagContext = {
  contextText: string;
  citations: CitationSource[];
  patterns: Array<{ entity: string; count: number }>;
};

export async function askLife(question: string, userId: string) {
  const rag = await buildRagContext(question, userId);

  const result = await generateText({
    model: getChatModel(),
    system: buildSystemPrompt(rag),
    prompt: question,
    temperature: 0.35,
  });

  return {
    answer: result.text,
    citations: rag.citations,
  };
}

export async function askLifeStream(messages: UIMessage[], userId: string) {
  const tools = createTools(userId);
  const question = getLatestUserText(messages);
  const rag = question
    ? await buildRagContext(question, userId)
    : { contextText: "", citations: [] };

  const modelMessages = await convertToModelMessages(messages, {
    tools,
    ignoreIncompleteToolCalls: true,
  });

  const result = streamText({
    model: getChatModel(),
    system: buildSystemPrompt(rag),
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(4),
    temperature: 0.35,
  });

  return {
    result,
    citations: rag.citations,
  };
}

async function buildRagContext(
  question: string,
  userId: string
): Promise<RagContext> {
  const rag = await buildRetrievedContext(question, userId);

  return {
    citations: rag.citations,
    contextText: rag.contextText,
    patterns: rag.patterns,
  };
}

function buildSystemPrompt(rag: RagContext) {
  return `You are Debo, the user's private AI life companion and journal analyst.

Use retrieved private context first. Be warm, precise, and grounded. If the retrieved context is thin, use the available tools before making claims about the user's life. Never invent journal facts, dates, people, or memories.

When you use journal evidence, mention the date naturally. When you use a persistent memory, identify it as a memory. If nothing relevant is found, say that Debo does not remember enough yet and offer a useful next step.

If recurring patterns are visible, highlight them briefly instead of treating each source as isolated data.

Recurring patterns:
${rag.patterns.length > 0 ? rag.patterns.map((pattern) => `- ${pattern.entity} (${pattern.count})`).join("\n") : "- None detected"}

Current date: ${new Date().toISOString().slice(0, 10)}

Retrieved context:
${rag.contextText || "No relevant journals or memories were retrieved before generation."}`;
}

function getLatestUserText(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!latestUserMessage) {
    return "";
  }

  return latestUserMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}
