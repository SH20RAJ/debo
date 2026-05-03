import "server-only";
import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL = "meta/llama-3.3-70b-instruct";
export const DEFAULT_EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5";

// Prioritize NVIDIA_API_KEY, fallback to OPENAI_API_KEY
// This prevents collisions if the user has a global OPENAI_API_KEY set
const NVIDIA_KEY = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

// Simple validation to help debugging
if (typeof window === 'undefined') {
  if (NVIDIA_KEY?.startsWith('sk-proj-') || NVIDIA_KEY?.startsWith('sk-')) {
    console.warn("⚠️ DEBO AI WARNING: Your API key looks like an OpenAI key, but you are targeting NVIDIA NIM. This will likely cause a 401 Unauthorized error. Please set NVIDIA_API_KEY in your .env file.");
  }
}

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
