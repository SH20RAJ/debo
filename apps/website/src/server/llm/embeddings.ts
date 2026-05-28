/**
 * Embeddings via NVIDIA NIM (OpenAI-compatible API).
 *
 * Default model: nvidia/nv-embedqa-e5-v5 (NV-EmbedQA, 1024 dims).
 * Override with DEBO_EMBEDDING_MODEL.
 *
 * Returns null when the embedding service is not configured.
 */

export type EmbeddingResult = {
  vector: number[];
  model: string;
  dim: number;
};

export async function embedText(text: string): Promise<EmbeddingResult | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const model = process.env.DEBO_EMBEDDING_MODEL || "nvidia/nv-embedqa-e5-v5";
  if (!apiKey || !text.trim()) return null;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text.slice(0, 8000),
      model,
      // NVIDIA's NV-EmbedQA expects an input_type. "passage" for indexing.
      input_type: "passage",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[embeddings] failed", res.status, body);
    return null;
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] };
  const vector = json.data?.[0]?.embedding;
  if (!vector?.length) return null;
  return { vector, model, dim: vector.length };
}

export async function embedQuery(text: string): Promise<EmbeddingResult | null> {
  const result = await embedText(text);
  if (!result) return null;
  return result; // same format; query type is handled server-side by the model
}
