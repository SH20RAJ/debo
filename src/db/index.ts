import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: DATABASE_URL is not set in production environment.");
}

// Use a placeholder if DATABASE_URL is missing to prevent build-time crashes
const sql = neon(databaseUrl || 'postgres://localhost:5432/placeholder_for_build');
export const db = drizzle(sql, { schema });
