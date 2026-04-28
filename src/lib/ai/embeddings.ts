import "server-only";

import { embed as embedWithModel } from "ai";

import { getEmbeddingModel } from "./openai";

export async function embed(text: string): Promise<number[]> {
  const value = text.replace(/\s+/g, " ").trim();

  if (!value) {
    throw new Error("Cannot embed empty text.");
  }

  const result = await embedWithModel({
    model: getEmbeddingModel(),
    value,
  });

  if (!Array.isArray(result.embedding) || result.embedding.length === 0) {
    throw new Error("Embedding provider returned an empty vector.");
  }

  return result.embedding;
}
