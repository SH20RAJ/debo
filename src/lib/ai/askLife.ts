import "server-only";

import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { fetchMemories } from "@/lib/ai/memories";
import { getChatModel } from "@/lib/ai/openai";
import { createTools } from "@/lib/ai/tools";
import {
  searchJournals,
  type CitationSource,
} from "@/lib/vector/search";

type RagContext = {
  contextText: string;
  citations: CitationSource[];
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
  const [journalResult, memoryResult] = await Promise.allSettled([
    searchJournals(question, userId, 6),
    fetchMemories(userId, question, 6),
  ]);

  const journals =
    journalResult.status === "fulfilled" ? journalResult.value : [];
  const memories =
    memoryResult.status === "fulfilled" ? memoryResult.value : [];

  if (journalResult.status === "rejected") {
    console.error("RAG journal retrieval failed:", journalResult.reason);
  }

  if (memoryResult.status === "rejected") {
    console.error("RAG memory retrieval failed:", memoryResult.reason);
  }

  const citations = dedupeCitations([...journals, ...memories]);

  return {
    citations,
    contextText: formatContext(journals, memories),
  };
}

function buildSystemPrompt(rag: RagContext) {
  return `You are Debo, the user's private AI life companion and journal analyst.

Use retrieved private context first. Be warm, precise, and grounded. If the retrieved context is thin, use the available tools before making claims about the user's life. Never invent journal facts, dates, people, or memories.

When you use journal evidence, mention the date naturally. When you use a persistent memory, identify it as a memory. If nothing relevant is found, say that Debo does not remember enough yet and offer a useful next step.

Current date: ${new Date().toISOString().slice(0, 10)}

Retrieved context:
${rag.contextText || "No relevant journals or memories were retrieved before generation."}`;
}

function formatContext(journals: CitationSource[], memories: CitationSource[]) {
  const journalText = journals
    .map((journal, index) => {
      const date = journal.date
        ? new Date(journal.date).toLocaleDateString("en", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Unknown date";

      return `[Journal ${index + 1}]
Date: ${date}
Title: ${journal.title || "Untitled"}
Snippet: ${journal.snippet}`;
    })
    .join("\n\n");

  const memoryText = memories
    .map(
      (memory, index) => `[Memory ${index + 1}]
Source: ${memory.source || "mem0"}
Snippet: ${memory.snippet}`
    )
    .join("\n\n");

  return [
    journalText ? `Journals:\n${journalText}` : "",
    memoryText ? `Memories:\n${memoryText}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
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

function dedupeCitations(citations: CitationSource[]) {
  const seen = new Set<string>();

  return citations.filter((citation) => {
    const key = `${citation.sourceType}:${citation.journalId || citation.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
