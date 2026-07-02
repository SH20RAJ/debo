import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { workspaces, users } from "@debo/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthUser } from "@/lib/auth";

/**
 * Standard JSON error response.
 */
export function apiError(message: string, status = 500, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Wrap a route handler so unhandled errors surface as { error } JSON
 * instead of crashing the function and returning the platform 500 page.
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
): Promise<T | NextResponse> {
  return handler().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : "internal_error";
    console.error("[api]", message, err);
    return apiError(message, 500);
  });
}

export { newId } from "./new-id";

/**
 * Authenticate the request and ensure the user has a personal workspace
 * row in our DB. Returns { user, workspaceId } or a 401/500 NextResponse.
 *
 * Stack Auth is the source of truth for identity; this just mirrors the user
 * row + a default workspace into our DB so foreign keys are satisfied.
 */
export async function requireSession(
  req: Request,
): Promise<{ user: AuthUser; workspaceId: string } | NextResponse> {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  // Ensure the user row exists. Stack Auth owns identity; we mirror it.
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.email || `${user.id}@unknown.local`,
      name: user.name || "User",
      avatarUrl: user.imageUrl,
    });
  }

  // Ensure a personal workspace exists for this user.
  // Convention: workspace.id === user.id for the personal workspace.
  const workspaceId = user.id;
  const existingWs = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (existingWs.length === 0) {
    await db.insert(workspaces).values({
      id: workspaceId,
      ownerUserId: user.id,
      name: `${user.name || "Personal"}'s Memory`,
      type: "personal",
    });
  }

  return { user, workspaceId };
}

/**
 * Parse JSON body safely, returning a 400 on parse error.
 */
export async function readJson<T>(req: Request): Promise<T | NextResponse> {
  try {
    return (await req.json()) as T;
  } catch {
    return apiError("invalid_json", 400);
  }
}
