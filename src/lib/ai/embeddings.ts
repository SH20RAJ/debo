import "server-only";

import { embed as embedWithModel } from "ai";

import { getEmbeddingModel, getEmbeddingModelId } from "./openai";

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

export async function embed(text: string): Promise<number[]> {
  const value = text.replace(/\s+/g, " ").trim();

  if (!value) {
    throw new Error("Cannot embed empty text.");
  }

  const result = await embedWithModel({
    model: getEmbeddingModel(),
    value,
  });

  if (!Array.isArray(result.embedding) || result.embedding.length === 0) {
    throw new Error("Embedding provider returned an empty vector.");
  }

  return result.embedding;
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
