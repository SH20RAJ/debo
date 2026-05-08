import "server-only";

const warnedScopes = new Set<string>();

export function isDatabaseUnavailable(error: unknown) {
  const value = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
    cause?: { code?: unknown; name?: unknown; message?: unknown };
    sourceError?: {
      code?: unknown;
      name?: unknown;
      message?: unknown;
      cause?: { code?: unknown; name?: unknown; message?: unknown };
    };
  };

  const code = String(
    value?.code ||
      value?.sourceError?.code ||
      value?.cause?.code ||
      value?.sourceError?.cause?.code ||
      ""
  );
  const name = String(
    value?.name ||
      value?.sourceError?.name ||
      value?.cause?.name ||
      value?.sourceError?.cause?.name ||
      ""
  );
  const message = String(
    value?.message ||
      value?.sourceError?.message ||
      value?.cause?.message ||
      value?.sourceError?.cause?.message ||
      error ||
      ""
  );

  return (
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "20" ||
    code === "AbortError" ||
    name === "AbortError" ||
    /fetch failed|connect timeout|timed out|network|operation was aborted|aborted/i.test(message)
  );
}

export function logDatabaseIssue(scope: string, error: unknown) {
  if (isDatabaseUnavailable(error)) {
    if (!warnedScopes.has(scope)) {
      warnedScopes.add(scope);
      console.warn(`[DB] ${scope}: database is offline or slow. Showing empty local-safe data.`);
    }
    return;
  }

  console.error(`[DB] ${scope}:`, error);
}
