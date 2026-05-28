/**
 * Qdrant vector store client.
 *
 * Required env:
 *   - QDRANT_URL
 *   - QDRANT_API_KEY
 *   - QDRANT_COLLECTION (default: debo_journals)
 *
 * Returns null on any path if Qdrant isn't configured. Callers should fall
 * back to keyword recency search.
 */

export type QdrantPoint = {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
};

type QdrantConfig = {
  url: string;
  apiKey: string;
  collection: string;
};

function getConfig(): QdrantConfig | null {
  const url = process.env.QDRANT_URL?.replace(/\/$/, "");
  const apiKey = process.env.QDRANT_API_KEY;
  const collection = process.env.QDRANT_COLLECTION || "debo_journals";
  if (!url || !apiKey) return null;
  return { url, apiKey, collection };
}

async function qdrantFetch(path: string, init?: RequestInit) {
  const cfg = getConfig();
  if (!cfg) return null;
  const res = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "api-key": cfg.apiKey,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[qdrant] ${path} ${res.status} ${body}`);
    return null;
  }
  return res.json();
}

/**
 * Ensure the collection exists with the given vector size. Idempotent.
 * Call once on first upsert per process.
 */
export async function ensureCollection(vectorSize: number): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg) return false;
  // Check existence
  const exists = await fetch(`${cfg.url}/collections/${cfg.collection}`, {
    headers: { "api-key": cfg.apiKey },
  });
  if (exists.ok) return true;
  // Create with default cosine distance.
  const res = await qdrantFetch(`/collections/${cfg.collection}`, {
    method: "PUT",
    body: JSON.stringify({
      vectors: { size: vectorSize, distance: "Cosine" },
    }),
  });
  return Boolean(res);
}

export async function upsertPoints(points: QdrantPoint[]): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg || points.length === 0) return false;
  const res = await qdrantFetch(`/collections/${cfg.collection}/points?wait=true`, {
    method: "PUT",
    body: JSON.stringify({ points }),
  });
  return Boolean(res);
}

export type QdrantSearchHit = {
  id: string;
  score: number;
  payload: Record<string, unknown>;
};

/**
 * Search vectors filtered by `userId` so we never leak across users.
 * Returns an empty array if Qdrant isn't configured.
 */
export async function searchSimilar(
  vector: number[],
  userId: string,
  limit = 8,
): Promise<QdrantSearchHit[]> {
  const cfg = getConfig();
  if (!cfg) return [];
  const res = await qdrantFetch(`/collections/${cfg.collection}/points/search`, {
    method: "POST",
    body: JSON.stringify({
      vector,
      limit,
      with_payload: true,
      filter: {
        must: [{ key: "userId", match: { value: userId } }],
      },
    }),
  });
  if (!res || !Array.isArray(res.result)) return [];
  return res.result as QdrantSearchHit[];
}

export async function deletePoints(ids: string[]): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg || ids.length === 0) return false;
  const res = await qdrantFetch(`/collections/${cfg.collection}/points/delete?wait=true`, {
    method: "POST",
    body: JSON.stringify({ points: ids }),
  });
  return Boolean(res);
}

export function isQdrantConfigured(): boolean {
  return getConfig() !== null;
}
