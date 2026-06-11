import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { users } from "@debo/db/schema";
import { eq } from "drizzle-orm";

/**
 * Authenticated user type returned by verifyAuth().
 */
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
  name: "Shaswat",
};

/**
 * Verify a Stack Auth access token via the REST API.
 * Returns the authenticated user or null.
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

    const data = (await res.json()) as {
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
 * Verify the current request's auth token.
 * Checks x-stack-access-token header first, then Authorization: Bearer.
 * In dev mode, returns a mock user if no valid token is found.
 */
export async function verifyAuth(req: Request): Promise<AuthUser | null> {
  const headers = new Headers(req.headers);

  // 1. Service-to-Service: Voice Agent authentication via internal secret
  const agentSecret = headers.get("x-agents-secret");
  const userId = headers.get("x-user-id");
  if (agentSecret && userId && process.env.AGENTS_INTERNAL_SECRET && agentSecret === process.env.AGENTS_INTERNAL_SECRET) {
    const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        imageUrl: dbUser.avatarUrl ?? undefined,
      };
    }
  }

  // Primary: x-stack-access-token (sent by the frontend api.ts)
  const stackToken = headers.get("x-stack-access-token");
  if (stackToken) {
    const user = await verifyStackToken(stackToken);
    if (user) return user;
  }

  // Fallback: Authorization: Bearer <token>
  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const user = await verifyStackToken(authHeader.slice(7));
    if (user) return user;
  }

  // Dev fallback: mock user so local dev works without auth
  if (IS_DEV) return MOCK_USER;

  return null;
}

/**
 * Helper: require auth or return 401 response.
 * Use in API route handlers:
 *   const user = await requireAuth(req);
 *   if (user instanceof NextResponse) return user;
 */
export async function requireAuth(req: Request): Promise<AuthUser | NextResponse> {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
