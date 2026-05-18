import "server-only";

import type { UIMessage } from "ai";

import { extractMemory } from "@/lib/memory/extract";
import { storeMemory } from "@/lib/memory/store";

type ProcessConversationMemoryInput = {
  userId: string;
  messages: UIMessage[];
};

export async function processConversationMemory({ userId, messages }: ProcessConversationMemoryInput) {
  const conversationText = messages
    .map((message) => {
      const body = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();

      return body ? `${message.role}: ${body}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  if (!conversationText) {
    return { facts: 0, entities: 0, emotions: 0, topics: 0 };
  }

  const extracted = await extractMemory(conversationText);
  const result = await storeMemory(userId, extracted);

  return {
    facts: result.factsInserted,
    entities: result.entitiesUpserted,
    emotions: extracted.emotions.length,
    topics: extracted.topics.length,
  };
}

export function getLatestUserMessage(messages: UIMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user");
}

export function getMessageText(message: UIMessage | undefined) {
  if (!message) return "";

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}