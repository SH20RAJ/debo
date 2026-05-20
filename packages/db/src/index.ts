import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
export * from './schema';

const databaseUrl = process.env.DATABASE_URL;
const defaultTimeout = process.env.NODE_ENV === "development" ? 3000 : 2500;
const neonFetchTimeoutMs = Number(process.env.NEON_FETCH_TIMEOUT_MS || defaultTimeout);

neonConfig.fetchFunction = async (input: string | URL | Request, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), neonFetchTimeoutMs);
  const upstreamSignal = init?.signal;

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort();
    } else {
      upstreamSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: DATABASE_URL is not set in production environment.");
}

// Use a placeholder if DATABASE_URL is missing to prevent build-time crashes
const sql = neon(databaseUrl || 'postgres://localhost:5432/placeholder_for_build');
export const db = drizzle(sql, { schema });
