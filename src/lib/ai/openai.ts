import "server-only";

import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL =
  "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const DEFAULT_EMBEDDING_MODEL = "workers-ai/@cf/qwen/qwen3-embedding-0.6b";

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Debo AI.`);
  }

  return value;
}

export function getOpenAIClient() {
  const apiKey = readRequiredEnv("OPENAI_API_KEY");
  return createOpenAI({
    baseURL: readRequiredEnv("OPENAI_BASE_URL"),
    apiKey: apiKey,
  });
}

export function getChatModel() {
  const modelId = process.env.OPENAI_MODEL || DEFAULT_CHAT_MODEL;
  return getOpenAIClient().chat(modelId);
}

export function getEmbeddingModel() {
  return getOpenAIClient().embedding(getEmbeddingModelId());
}

export function getEmbeddingModelId() {
  return process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}
