import type { Context, Next } from "hono";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

// Mock user for development — replace with real session/auth lookup later
const MOCK_USER: AuthUser = {
  id: "dev-user-001",
  email: "dev@debo.life",
  name: "Dev User",
};

/**
 * Extract the authenticated user from the request.
 * Currently returns a mock user. Replace with real session verification
 * (e.g. Better Auth cookie check or Bearer token lookup).
 */
export async function getUser(c: Context): Promise<AuthUser | null> {
  // TODO: Real auth — check session cookie or Authorization header
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // Future: validate token against session table
  }
  return MOCK_USER;
}

/**
 * Middleware that requires authentication.
 * Sets `c.get("user")` on success; returns 401 on failure.
 */
export async function requireAuth(c: Context, next: Next) {
  const user = await getUser(c);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", user);
  await next();
}
