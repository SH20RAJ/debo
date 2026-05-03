import "server-only";
import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL = "meta/llama-3.3-70b-instruct";
export const DEFAULT_EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5";

// Hardcoded for NVIDIA NIM as requested/verified
const NVIDIA_KEY = process.env.OPENAI_API_KEY;
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

/**
 * Vercel AI SDK Provider for NVIDIA NIM
 */
export const aiProvider = createOpenAI({
  apiKey: NVIDIA_KEY,
  baseURL: NVIDIA_BASE_URL,
});

export function getChatModel() {
  // Explicitly use chat() to avoid falling back to other endpoints like /responses
  return aiProvider.chat(DEFAULT_CHAT_MODEL);
}

export function getEmbeddingModel() {
  return aiProvider.embedding(DEFAULT_EMBEDDING_MODEL);
}

export function getEmbeddingModelId() {
  return DEFAULT_EMBEDDING_MODEL;
}
