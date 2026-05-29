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

export type EmbeddingResult = {
  vector: number[];
  model: string;
  dim: number;
};

function pickDefaults() {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const isNvidia = baseUrl.includes("nvidia.com");
  return {
    baseUrl,
    isNvidia,
    model: isNvidia
      ? "nvidia/llama-3.2-nv-embedqa-1b-v2"
      : "text-embedding-3-small",
  };
}

export async function embedText(text: string): Promise<EmbeddingResult | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY;
  const defaults = pickDefaults();
  const model = process.env.DEBO_EMBEDDING_MODEL || defaults.model;
  if (!apiKey || !text.trim()) return null;

  const body: Record<string, unknown> = {
    input: text.slice(0, 8000),
    model,
  };
  // NVIDIA's NV-EmbedQA models require an input_type. OpenAI ignores extras.
  if (defaults.isNvidia) body.input_type = "passage";

  const res = await fetch(`${defaults.baseUrl.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
  return { vector, model, dim: vector.length };
}

export async function embedQuery(text: string): Promise<EmbeddingResult | null> {
  return embedText(text);
}
