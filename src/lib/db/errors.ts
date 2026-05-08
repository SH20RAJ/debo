import "server-only";

const warnedScopes = new Set<string>();

export function isDatabaseUnavailable(error: unknown) {
  const value = error as {
    code?: unknown;
    message?: unknown;
    cause?: { code?: unknown; message?: unknown };
    sourceError?: {
      code?: unknown;
      message?: unknown;
      cause?: { code?: unknown; message?: unknown };
    };
  };

  const code = String(
    value?.code ||
      value?.sourceError?.code ||
      value?.cause?.code ||
      value?.sourceError?.cause?.code ||
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
    code === "AbortError" ||
    /fetch failed|connect timeout|timed out|network/i.test(message)
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
