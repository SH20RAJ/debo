import "server-only";

import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL =
  "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-large";

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Debo AI.`);
  }

  return value;
}

export function getOpenAIClient() {
  return createOpenAI({
    baseURL: readRequiredEnv("OPENAI_BASE_URL"),
    apiKey: readRequiredEnv("OPENAI_API_KEY"),
  });
}

export function getChatModel() {
  return getOpenAIClient()(process.env.OPENAI_MODEL || DEFAULT_CHAT_MODEL);
}

export function getEmbeddingModel() {
  return getOpenAIClient().embedding(getEmbeddingModelId());
}

export function getEmbeddingModelId() {
  return process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}
