import type { Context } from "hono";
import { type ZodSchema, ZodError } from "zod";

/**
 * Parse and validate JSON body against a Zod schema.
 * Throws ZodError on validation failure.
 */
export async function parseBody<T>(c: Context, schema: ZodSchema<T>): Promise<T> {
  const body = await c.req.json();
  return schema.parse(body);
}

/**
 * Parse query parameters against a Zod schema.
 */
export function parseQuery<T>(c: Context, schema: ZodSchema<T>): T {
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(c.req.query())) {
    if (value !== undefined) raw[key] = value;
  }
  return schema.parse(raw);
}
