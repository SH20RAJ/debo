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

interface QdrantCircuitState {
  collectionVerified: boolean;
  lastErrorTime: number;
}

const globalForQdrant = global as typeof globalThis & {
  qdrantCircuitState?: QdrantCircuitState;
};

if (!globalForQdrant.qdrantCircuitState) {
  globalForQdrant.qdrantCircuitState = {
    collectionVerified: false,
    lastErrorTime: 0,
  };
}

const qdrantState = globalForQdrant.qdrantCircuitState;
const CIRCUIT_BREAKER_DURATION_MS = 60000; // 1 minute (60s)

function isCircuitActive(): boolean {
  if (qdrantState.lastErrorTime === 0) return false;
  return Date.now() - qdrantState.lastErrorTime < CIRCUIT_BREAKER_DURATION_MS;
}

function tripCircuit() {
  qdrantState.lastErrorTime = Date.now();
  qdrantState.collectionVerified = false; // Reset collection verification state
}

async function qdrantFetch(path: string, init?: RequestInit) {
  if (isCircuitActive()) return null;
  const cfg = getConfig();
  if (!cfg) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 1200); // 1.2s timeout to prevent thread blocking

  try {
    const res = await fetch(`${cfg.url}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-key": cfg.apiKey,
        ...(init?.headers ?? {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[qdrant] ${path} ${res.status} ${body} (tripping circuit breaker)`);
      tripCircuit();
      return null;
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[qdrant] fetch failed for ${path}: ${err.message || err} (tripping circuit breaker)`);
    tripCircuit();
    return null;
  }
}

/**
 * Ensure the collection exists with the given vector size. Idempotent.
 * Call once on first upsert per process.
 */
export async function ensureCollection(vectorSize: number): Promise<boolean> {
  if (qdrantState.collectionVerified) return true;
  if (isCircuitActive()) return false;
  const cfg = getConfig();
  if (!cfg) return false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 1200); // 1.2s timeout

  try {
    const exists = await fetch(`${cfg.url}/collections/${cfg.collection}`, {
      signal: controller.signal,
      headers: { "api-key": cfg.apiKey },
    });
    clearTimeout(timeoutId);

    if (exists.ok) {
      qdrantState.collectionVerified = true;
      return true;
    }

    if (exists.status === 404) {
      console.log(`[qdrant] Collection ${cfg.collection} not found, attempting to create...`);
      // Create with default cosine distance.
      const res = await qdrantFetch(`/collections/${cfg.collection}`, {
        method: "PUT",
        body: JSON.stringify({
          vectors: { size: vectorSize, distance: "Cosine" },
        }),
      });
      if (!res) {
        tripCircuit();
        return false;
      }

      // Create payload index on userId (required for filter query operations)
      await qdrantFetch(`/collections/${cfg.collection}/index?wait=true`, {
        method: "PUT",
        body: JSON.stringify({
          field_name: "userId",
          field_schema: "keyword",
        }),
      });

      qdrantState.collectionVerified = true;
      return true;
    }

    tripCircuit();
    return false;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[qdrant] ensureCollection failed: ${err.message || err} (tripping circuit breaker)`);
    tripCircuit();
    return false;
  }
}

export async function upsertPoints(points: QdrantPoint[]): Promise<boolean> {
  if (isCircuitActive()) return false;
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
  if (isCircuitActive()) return [];
  const cfg = getConfig();
  if (!cfg) return [];
  
  // Ensure the collection exists before searching
  const verified = await ensureCollection(vector.length);
  if (!verified) return [];

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
  if (isCircuitActive()) return false;
  const cfg = getConfig();
  if (!cfg || ids.length === 0) return false;
  const res = await qdrantFetch(`/collections/${cfg.collection}/points/delete?wait=true`, {
    method: "POST",
    body: JSON.stringify({ points: ids }),
  });
  return Boolean(res);
}

export function isQdrantConfigured(): boolean {
  if (isCircuitActive()) return false;
  return getConfig() !== null;
}
