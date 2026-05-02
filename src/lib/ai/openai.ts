import "server-only";
import OpenAI from "openai";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Standard Debo AI Client
 * Uses Cloudflare AI Gateway in compatibility mode.
 */
export const client = new OpenAI({
  apiKey: process.env.CF_AIG_TOKEN || process.env.OPENAI_API_KEY,
  baseURL:
    process.env.OPENAI_BASE_URL ||
    "https://gateway.ai.cloudflare.com/v1/091539408595ba99a0ef106d42391d5b/default/compat",
});

export const DEFAULT_CHAT_MODEL =
  process.env.OPENAI_MODEL || "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const DEFAULT_EMBEDDING_MODEL = 
  process.env.OPENAI_EMBEDDING_MODEL || "workers-ai/@cf/qwen/qwen3-embedding-0.6b";

/**
 * Vercel AI SDK Provider
 * Allows using the Cloudflare Gateway client with 'ai' package tools like streamText.
 */
export const aiProvider = createOpenAI({
  apiKey: process.env.CF_AIG_TOKEN || process.env.OPENAI_API_KEY,
  baseURL:
    process.env.OPENAI_BASE_URL ||
    "https://gateway.ai.cloudflare.com/v1/091539408595ba99a0ef106d42391d5b/default/compat",
});

export function getChatModel() {
  return aiProvider.chat(DEFAULT_CHAT_MODEL);
}

export function getEmbeddingModel() {
  return aiProvider.embedding(DEFAULT_EMBEDDING_MODEL);
}

export function getEmbeddingModelId() {
  return DEFAULT_EMBEDDING_MODEL;
}
