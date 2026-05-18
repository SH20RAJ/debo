import "server-only";

export type QdrantVectorPayload = {
  userId: string;
  journalId: string;
  content: string;
  createdAt: string;
  title?: string | null;
  chunkIndex?: number;
  chunkCount?: number;
};

export type QdrantMatch = {
  id: string | number;
  score: number;
  payload?: QdrantVectorPayload;
};

type UpsertVectorInput = {
  id: string;
  vector: number[];
  payload: QdrantVectorPayload;
};

const qdrantFetchTimeoutMs = Number(process.env.QDRANT_FETCH_TIMEOUT_MS || 2500);

export class QdrantRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "QdrantRequestError";
  }
}

export function isQdrantAuthError(error: unknown) {
  return error instanceof QdrantRequestError && (error.status === 401 || error.status === 403);
}

export function getQdrantErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getQdrantConfig() {
  const url = process.env.QDRANT_URL?.replace(/\/+$/, "");
  const apiKey = process.env.QDRANT_API_KEY;
  const collection = process.env.QDRANT_COLLECTION || "debo_journals";

  if (!url) {
    throw new Error("QDRANT_URL is required for vector search. Check your environment variables.");
  }

  if (!apiKey) {
    throw new Error("QDRANT_API_KEY is required for vector search. Check your environment variables.");
  }

  return { url, apiKey, collection };
}

export async function checkQdrantConnection() {
  try {
    const { url } = getQdrantConfig();
    const response = await fetch(`${url}/healthz`, {
      method: "GET",
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch (error) {
    console.error("Qdrant health check failed:", error);
    return false;
  }
}

async function qdrantRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { url, apiKey } = getQdrantConfig();
  const signal = init.signal || AbortSignal.timeout(qdrantFetchTimeoutMs);
  const response = await fetch(`${url}${path}`, {
    ...init,
    signal,
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new QdrantRequestError(
      `Qdrant request failed (${response.status}): ${body.slice(0, 500)}`,
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function getCollectionPath() {
  return `/collections/${encodeURIComponent(getQdrantConfig().collection)}`;
}

function readVectorSize(collectionInfo: unknown) {
  const info = collectionInfo as { result?: { config?: { params?: { vectors?: { size?: number } | Record<string, { size?: number }> } } } };
  const vectors = info?.result?.config?.params?.vectors;

  if (vectors && "size" in vectors && typeof vectors.size === "number") {
    return vectors.size;
  }

  if (vectors && typeof vectors === "object") {
    const firstNamedVector = Object.values(vectors)[0] as { size?: number };
    return firstNamedVector?.size;
  }

  return undefined;
}

export async function ensureCollection(vectorSize: number) {
  const path = getCollectionPath();

  try {
    const collectionInfo = await qdrantRequest<unknown>(path);
    const existingSize = readVectorSize(collectionInfo);

    if (existingSize && existingSize !== vectorSize) {
      console.warn(
        `[Qdrant] Recreating ${getQdrantConfig().collection} because vector size changed from ${existingSize} to ${vectorSize}.`
      );
      await qdrantRequest(path, { method: "DELETE" });
      await createCollection(vectorSize);
    }

    return;
  } catch (error) {
    if (!(error instanceof QdrantRequestError) || error.status !== 404) {
      throw error;
    }
  }

  await createCollection(vectorSize);
}

async function createCollection(vectorSize: number) {
  await qdrantRequest(getCollectionPath(), {
    method: "PUT",
    body: JSON.stringify({
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    }),
  });
}

export async function upsertVector({ id, vector, payload }: UpsertVectorInput) {
  await ensureCollection(vector.length);

  await qdrantRequest(`${getCollectionPath()}/points?wait=true`, {
    method: "PUT",
    body: JSON.stringify({
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    }),
  });
}

export async function deleteVector(id: string) {
  try {
    await qdrantRequest(`${getCollectionPath()}/points/delete?wait=true`, {
      method: "POST",
      body: JSON.stringify({
        points: [id],
      }),
    });
  } catch (error) {
    if (error instanceof QdrantRequestError && error.status === 404) {
      return;
    }

    throw error;
  }
}

export async function deleteVectorsByFilter(filter: Record<string, unknown>) {
  try {
    await qdrantRequest(`${getCollectionPath()}/points/delete?wait=true`, {
      method: "POST",
      body: JSON.stringify({
        filter,
      }),
    });
  } catch (error) {
    if (error instanceof QdrantRequestError && error.status === 404) {
      return;
    }

    throw error;
  }
}

export async function searchVector(
  queryVector: number[],
  userId: string,
  limit = 5
): Promise<QdrantMatch[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 20);

  try {
    const response = await qdrantRequest<{ result?: QdrantMatch[] }>(
      `${getCollectionPath()}/points/search`,
      {
        method: "POST",
        body: JSON.stringify({
          vector: queryVector,
          limit: safeLimit,
          with_payload: true,
          with_vector: false,
          filter: {
            must: [
              {
                key: "userId",
                match: {
                  value: userId,
                },
              },
            ],
          },
        }),
      }
    );

    return response.result || [];
  } catch (error) {
    if (error instanceof QdrantRequestError && error.status === 404) {
      return [];
    }

    throw error;
  }
}
