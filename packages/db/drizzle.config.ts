import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

// Single source of truth: monorepo root .env.local (then fall back to local .env)
loadEnv({ path: resolve(__dirname, "../../.env.local") });
loadEnv();

export default defineConfig({
  out: "./src/migrations",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
