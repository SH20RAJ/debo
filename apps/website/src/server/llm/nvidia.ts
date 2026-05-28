import { ChatOpenAI } from "@langchain/openai";

/**
 * NVIDIA NIM is OpenAI-compatible. We point LangChain's ChatOpenAI at the
 * NVIDIA endpoint and use the Nemotron / Llama models defined in env.
 *
 * Required env:
 *   - OPENAI_API_KEY   (NVIDIA NIM key, e.g. nvapi-xxx)
 *   - OPENAI_BASE_URL  (https://integrate.api.nvidia.com/v1)
 *   - OPENAI_MODEL     (e.g. meta/llama-3.3-70b-instruct)
 */

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getLlmConfig(): LlmConfig | null {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const model = process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct";
  if (!apiKey) return null;
  return { apiKey, baseUrl, model };
}

/**
 * Build a configured ChatOpenAI instance pointed at NVIDIA NIM.
 * Returns null when the LLM is not configured so callers can decide
 * whether to surface a 503 or fall back gracefully.
 */
export function getChatModel(opts?: {
  temperature?: number;
  streaming?: boolean;
  modelOverride?: string;
}): ChatOpenAI | null {
  const cfg = getLlmConfig();
  if (!cfg) return null;
  return new ChatOpenAI({
    apiKey: cfg.apiKey,
    model: opts?.modelOverride ?? cfg.model,
    temperature: opts?.temperature ?? 0.3,
    streaming: opts?.streaming ?? false,
    configuration: { baseURL: cfg.baseUrl },
  });
}
