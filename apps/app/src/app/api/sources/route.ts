import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";


/**
 * GET /api/sources — List all sources for the authenticated user.
 * Optional ?type=journal filter.
 */
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const type = req.nextUrl.searchParams.get("type");

  // Build conditions: always scope by userId, optionally filter by type
  const conditions = [eq(sources.userId, user.id)];
  if (type) conditions.push(eq(sources.type, type as any));

  const rows = await db
    .select()
    .from(sources)
    .where(and(...conditions))
    .orderBy(desc(sources.createdAt));

  return NextResponse.json(rows);
}

/**
 * POST /api/sources — Create a new source (journal entry, voice note, etc).
 */
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const id = crypto.randomUUID();

  const [created] = await db
    .insert(sources)
    .values({
      id,
      userId: user.id,
      workspaceId: user.id, // single-user workspace for now
      type: body.type ?? "manual",
      title: body.title ?? "Untitled",
      description: body.description,
      plainText: body.content, // journal content stored in plainText
      status: "draft",
      origin: body.origin ?? "manual",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
