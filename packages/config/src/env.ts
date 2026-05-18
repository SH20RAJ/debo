import { z } from "zod";

/**
 * Server-side environment variable validation.
 * Only call this in server contexts — it will throw if required vars are missing.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_MODEL: z.string().default("workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-large"),
  QDRANT_URL: z.string().url().optional(),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().default("debo_journals"),
  ENCRYPTION_KEY: z.string().length(64).optional(),
  NVIDIA_API_KEY: z.string().optional(),
  MEM0_API_KEY: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  STACK_SECRET_SERVER_KEY: z.string().optional(),
  NANGO_SECRET_KEY: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validate and return server environment variables.
 * Throws with a clear message if validation fails.
 */
export function getServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${missing}`);
  }
  return result.data;
}
