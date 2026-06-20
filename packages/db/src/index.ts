import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
export * from './schema';

const databaseUrl = process.env.DATABASE_URL;
const defaultTimeout = process.env.NODE_ENV === "development" ? 15000 : 10000;
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

if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL is not set. DB queries will fail at runtime.");
}

// Use a neon-compatible placeholder to prevent build/import-time crashes
const sql = neon(databaseUrl || 'postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder');
export const db = drizzle(sql, { schema });
