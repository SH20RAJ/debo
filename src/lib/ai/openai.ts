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

/**
 * Custom fetch wrapper to convert standard Authorization header to Cloudflare's cf-aig-authorization header.
 * This is required because Cloudflare AI Gateway uses a non-standard authorization header name.
 */
function cloudflareAuthFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init);
  
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    request.headers.delete("authorization");
    request.headers.set("cf-aig-authorization", authHeader);
  }
  
  return fetch(request);
}

export function getOpenAIClient() {
  const apiKey = readRequiredEnv("OPENAI_API_KEY");
  const baseURL = readRequiredEnv("OPENAI_BASE_URL");
  
  // Use Cloudflare's gateway if the base URL contains cloudflare
  const fetch = baseURL.includes("cloudflare") ? cloudflareAuthFetch : undefined;
  
  return createOpenAI({
    baseURL,
    apiKey,
    fetch,
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
