import type { Context, Next } from "hono";

const AGENTS_INTERNAL_SECRET = process.env.AGENTS_INTERNAL_SECRET;

/**
 * Middleware that requires the internal service secret.
 *
 * This service is NOT publicly accessible. Only apps/api should call it,
 * passing the shared secret via the x-agents-secret header.
 */
export async function requireInternalAuth(c: Context, next: Next) {
  if (!AGENTS_INTERNAL_SECRET) {
    // In dev mode without secret configured, allow all requests
    if (process.env.NODE_ENV !== "production") {
      await next();
      return;
    }
    return c.json({ error: "Service not configured" }, 503);
  }

  const secret = c.req.header("x-agents-secret");
  if (secret !== AGENTS_INTERNAL_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}
