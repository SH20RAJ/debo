import type { Context, Next } from "hono";
import type { AuthUser } from "./auth";

export type AppContext = {
  userId: string;
  workspaceId: string; // same as userId for single-user MVP
  user: AuthUser;
};

/**
 * Middleware that builds a request-scoped context from the authenticated user.
 * Must run after requireAuth.
 */
export async function contextMiddleware(c: Context, next: Next) {
  const user = c.get("user") as AuthUser;
  const ctx: AppContext = {
    userId: user.id,
    workspaceId: user.id, // single-user workspace for now
    user,
  };
  c.set("ctx", ctx);
  await next();
}

/**
 * Helper to grab the typed context from a Hono handler.
 */
export function getAppContext(c: Context): AppContext {
  return c.get("ctx") as AppContext;
}
