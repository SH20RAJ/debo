import "server-only";

export type QdrantVectorPayload = {
  userId: string;
  journalId: string;
  content: string;
  createdAt: string;
  title?: string | null;
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

class QdrantRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "QdrantRequestError";
  }
}

function getQdrantConfig() {
  const url = process.env.QDRANT_URL?.replace(/\/+$/, "");
  const apiKey = process.env.QDRANT_API_KEY;
  const collection = process.env.QDRANT_COLLECTION || "debo_journals";

  if (!url) {
    throw new Error("QDRANT_URL is required for vector search.");
  }

  if (!apiKey) {
    throw new Error("QDRANT_API_KEY is required for vector search.");
  }

  return { url, apiKey, collection };
}

async function qdrantRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { url, apiKey } = getQdrantConfig();
  const response = await fetch(`${url}${path}`, {
    ...init,
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
  const vectors = (collectionInfo as any)?.result?.config?.params?.vectors;

  if (typeof vectors?.size === "number") {
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
      throw new Error(
        `Qdrant collection vector size mismatch. Expected ${existingSize}, received ${vectorSize}.`
      );
    }

    return;
  } catch (error) {
    if (!(error instanceof QdrantRequestError) || error.status !== 404) {
      throw error;
    }
  }

  await qdrantRequest(path, {
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
