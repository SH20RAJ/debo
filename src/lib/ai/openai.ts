import "server-only";
import OpenAI from "openai";
import { createOpenAI } from "@ai-sdk/openai";

const baseURL = process.env.OPENAI_BASE_URL || "https://gateway.ai.cloudflare.com/v1/091539408595ba99a0ef106d42391d5b/default/workers-ai/v1";
const apiKey = process.env.CF_AIG_TOKEN || process.env.OPENAI_API_KEY;

export const client = new OpenAI({
  apiKey,
  baseURL,
});

export const DEFAULT_CHAT_MODEL =
  process.env.OPENAI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const DEFAULT_EMBEDDING_MODEL = 
  process.env.OPENAI_EMBEDDING_MODEL || "@cf/qwen/qwen3-embedding-0.6b";

/**
 * Vercel AI SDK Provider
 * Allows using the Cloudflare Gateway client with 'ai' package tools like streamText.
 */
export const aiProvider = createOpenAI({
  apiKey,
  baseURL,
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
