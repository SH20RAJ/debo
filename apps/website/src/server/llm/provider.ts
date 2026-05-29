/**
 * Single source of truth for LLM provider resolution.
 *
 * The #1 cause of "401 Invalid bearer token" was mixing a key from one
 * provider with another provider's base URL (e.g. an OpenAI sk- key sent to
 * the NVIDIA endpoint). This resolves a COHERENT tuple — base URL, key, chat
 * model, embed model all from the same provider — so they can never mismatch.
 *
 * Priority:
 *   1. NVIDIA_API_KEY present            -> NVIDIA NIM
 *   2. OPENAI_API_KEY + nvidia base URL  -> NVIDIA NIM (key is really nvapi-…)
 *   3. OPENAI_API_KEY present            -> OpenAI
 *   4. nothing                            -> null (callers degrade gracefully)
 *
 * Any field can be overridden explicitly via env.
 */

export type Provider = "nvidia" | "openai";

export type ResolvedProvider = {
  provider: Provider;
  baseURL: string;
  apiKey: string;
  chatModel: string;
  embedModel: string;
  embedInputType: boolean; // NVIDIA NV-EmbedQA needs an input_type field
};

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const OPENAI_BASE = "https://api.openai.com/v1";

export function resolveProvider(): ResolvedProvider | null {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const explicitBase = process.env.OPENAI_BASE_URL || process.env.NVIDIA_BASE_URL;
  const baseLooksNvidia = (explicitBase ?? "").includes("nvidia.com");

  // 1) Dedicated NVIDIA key wins.
  if (nvidiaKey) {
    return {
      provider: "nvidia",
      baseURL: process.env.NVIDIA_BASE_URL || OPENAI_BASE_URL_IfNvidia(explicitBase) || NVIDIA_BASE,
      apiKey: nvidiaKey,
      chatModel:
        process.env.NVIDIA_ANSWER_MODEL ||
        process.env.DEBO_ANSWER_MODEL ||
        "meta/llama-3.3-70b-instruct",
      embedModel:
        process.env.DEBO_EMBEDDING_MODEL || "nvidia/llama-3.2-nv-embedqa-1b-v2",
      embedInputType: true,
    };
  }

  // 2) OPENAI_API_KEY but pointed at NVIDIA endpoint (common nvapi- setup).
  if (openaiKey && baseLooksNvidia) {
    return {
      provider: "nvidia",
      baseURL: explicitBase || NVIDIA_BASE,
      apiKey: openaiKey,
      chatModel:
        process.env.NVIDIA_ANSWER_MODEL ||
        process.env.DEBO_ANSWER_MODEL ||
        "meta/llama-3.3-70b-instruct",
      embedModel:
        process.env.DEBO_EMBEDDING_MODEL || "nvidia/llama-3.2-nv-embedqa-1b-v2",
      embedInputType: true,
    };
  }

  // 3) Plain OpenAI.
  if (openaiKey) {
    return {
      provider: "openai",
      baseURL: explicitBase || OPENAI_BASE,
      apiKey: openaiKey,
      chatModel:
        process.env.DEBO_ANSWER_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
      embedModel:
        process.env.DEBO_EMBEDDING_MODEL || "text-embedding-3-small",
      embedInputType: false,
    };
  }

  return null;
}

// If someone set OPENAI_BASE_URL to an nvidia endpoint while also having
// NVIDIA_API_KEY, honor that explicit base.
function OPENAI_BASE_URL_IfNvidia(base?: string): string | undefined {
  return base && base.includes("nvidia.com") ? base : undefined;
}

export function isLlmConfigured(): boolean {
  return resolveProvider() !== null;
}
