import "server-only";

import { embed as embedWithAiSdk } from "ai";

import {
  getEmbeddingModel,
  getEmbeddingModelId,
  getNvidiaApiKey,
  getNvidiaBaseUrl,
} from "./openai";

const embeddingWarnings = new Set<string>();

type EmbeddingError = {
  statusCode?: unknown;
  status?: unknown;
  responseBody?: unknown;
  message?: unknown;
  url?: unknown;
  cause?: {
    statusCode?: unknown;
    status?: unknown;
    responseBody?: unknown;
    message?: unknown;
  };
};

type EmbeddingInputType = "query" | "passage";

function normalizeEmbeddingModelId(modelId: string) {
  return modelId.replace(/-(query|passage)$/i, "");
}

function shouldUseNvidiaDirectEmbeddings(modelId: string) {
  return /^nvidia\//i.test(modelId);
}

export async function embed(text: string, inputType: EmbeddingInputType = "passage"): Promise<number[]> {
  const value = text.replace(/\s+/g, " ").trim();

  if (!value) {
    throw new Error("Cannot embed empty text.");
  }

  const modelId = getEmbeddingModelId();

  if (shouldUseNvidiaDirectEmbeddings(modelId)) {
    return embedWithNvidia(value, inputType);
  }

  const result = await embedWithAiSdk({
    model: getEmbeddingModel(),
    value,
  });

  if (!Array.isArray(result.embedding) || result.embedding.length === 0) {
    throw new Error("Embedding provider returned an empty vector.");
  }

  return result.embedding;
}

async function embedWithNvidia(value: string, inputType: EmbeddingInputType) {
  const apiKey = getNvidiaApiKey();

  if (!apiKey) {
    throw Object.assign(new Error("Missing NVIDIA_API_KEY for embeddings."), {
      statusCode: 401,
    });
  }

  const response = await fetch(`${getNvidiaBaseUrl()}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: normalizeEmbeddingModelId(getEmbeddingModelId()),
      input: [value],
      input_type: inputType,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    throw Object.assign(new Error(responseBody || "NVIDIA embedding request failed."), {
      statusCode: response.status,
      responseBody,
    });
  }

  const data = (await response.json()) as {
    data?: Array<{ embedding?: unknown }>;
  };
  const embedding = data.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Embedding provider returned an empty vector.");
  }

  return embedding.map((value) => Number(value));
}

export function isEmbeddingProviderUnavailable(error: unknown) {
  const value = error as EmbeddingError;
  const statusCode = Number(value?.statusCode || value?.status || value?.cause?.statusCode || value?.cause?.status);
  const message = String(
    value?.message ||
      value?.responseBody ||
      value?.cause?.message ||
      value?.cause?.responseBody ||
      error ||
      ""
  );

  return (
    [400, 401, 403, 404].includes(statusCode) ||
    /not found|unauthorized|forbidden|invalid.*model|model.*not.*found|embedding.*provider/i.test(message)
  );
}

export function getEmbeddingProviderMessage(error: unknown) {
  const value = error as EmbeddingError;
  const statusCode = value?.statusCode || value?.status || value?.cause?.statusCode || value?.cause?.status;
  const body = value?.responseBody || value?.cause?.responseBody;
  const message = String(body || value?.message || value?.cause?.message || "embedding request failed").trim();
  const prefix = statusCode ? `status ${statusCode}` : "provider error";

  return `${getEmbeddingModelId()} ${prefix}: ${message}`;
}

export function warnEmbeddingProvider(scope: string, error: unknown) {
  if (!isEmbeddingProviderUnavailable(error)) return false;

  if (!embeddingWarnings.has(scope)) {
    embeddingWarnings.add(scope);
    console.warn(`[Vector] ${scope}: semantic vectors are off for now. ${getEmbeddingProviderMessage(error)}`);
  }

  return true;
}
