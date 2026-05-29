/**
 * Embeddings via OpenAI-compatible API.
 *
 * Auto-detects provider:
 *   - If OPENAI_BASE_URL points at NVIDIA NIM (integrate.api.nvidia.com),
 *     uses nvidia/llama-3.2-nv-embedqa-1b-v2 (current 2026 model).
 *   - Otherwise (OpenAI default), uses text-embedding-3-small.
 *
 * Override either with DEBO_EMBEDDING_MODEL.
 *
 * Returns null when the embedding service is not configured.
 */

import { resolveProvider } from "./provider";

export type EmbeddingResult = {
  vector: number[];
  model: string;
  dim: number;
};

export async function embedText(text: string): Promise<EmbeddingResult | null> {
  const cfg = resolveProvider();
  if (!cfg || !text.trim()) return null;

  const body: Record<string, unknown> = {
    input: text.slice(0, 8000),
    model: cfg.embedModel,
  };
  // NVIDIA's NV-EmbedQA models require an input_type. OpenAI ignores extras.
  if (cfg.embedInputType) body.input_type = "passage";

  const res = await fetch(`${cfg.baseURL.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[embeddings] failed", res.status, errBody);
    return null;
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] };
  const vector = json.data?.[0]?.embedding;
  if (!vector?.length) return null;
  return { vector, model: cfg.embedModel, dim: vector.length };
}

export async function embedQuery(text: string): Promise<EmbeddingResult | null> {
  return embedText(text);
}
