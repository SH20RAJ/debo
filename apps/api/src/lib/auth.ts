import type { Context, Next } from "hono";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
};

const STACK_AUTH_API = "https://api.stack-auth.com/api/v1";
const STACK_SECRET_KEY = process.env.STACK_SECRET_SERVER_KEY;
const STACK_PROJECT_ID = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const IS_DEV = process.env.NODE_ENV !== "production";

const MOCK_USER: AuthUser = {
  id: "dev-user-001",
  email: "dev@debo.life",
  name: "Dev User",
};

/**
 * Verify a Stack Auth access token via the REST API.
 * Calls GET /users/me with the token and server credentials.
 */
async function verifyStackToken(accessToken: string): Promise<AuthUser | null> {
  if (!STACK_SECRET_KEY || !STACK_PROJECT_ID) {
    console.warn("[auth] Stack Auth env vars not configured");
    return null;
  }

  try {
    const res = await fetch(`${STACK_AUTH_API}/users/me`, {
      headers: {
        "x-stack-access-type": "server",
        "x-stack-project-id": STACK_PROJECT_ID,
        "x-stack-secret-server-key": STACK_SECRET_KEY,
        "x-stack-access-token": accessToken,
      },
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      id?: string;
      userId?: string;
      primary_email?: string;
      display_name?: string;
      profile_image_url?: string;
    };

    const userId = data.id ?? data.userId;
    if (!userId) return null;

    return {
      id: userId,
      email: data.primary_email ?? "",
      name: data.display_name ?? data.primary_email ?? "User",
      imageUrl: data.profile_image_url ?? undefined,
    };
  } catch (err) {
    console.error("[auth] Stack Auth verification failed:", err);
    return null;
  }
}

/**
 * Extract the authenticated user from the request.
 *
 * Checks headers in order:
 *  1. x-stack-access-token — Stack Auth access token sent by the frontend
 *  2. Authorization: Bearer <token> — fallback for other clients
 *
 * In development mode with no valid token, returns the mock user.
 */
export async function getUser(c: Context): Promise<AuthUser | null> {
  // x-stack-access-token is the primary header the frontend uses
  const stackToken = c.req.header("x-stack-access-token");
  if (stackToken) {
    const user = await verifyStackToken(stackToken);
    if (user) return user;
  }

  // Fallback: Authorization: Bearer <token>
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = await verifyStackToken(token);
    if (user) return user;
  }

  // Dev fallback: return mock user so local dev works without auth
  if (IS_DEV) {
    return MOCK_USER;
  }

  return null;
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
