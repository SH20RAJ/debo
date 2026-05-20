import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";


/**
 * GET /api/sources/:id — Get a single source by ID.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const [source] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.id, id), eq(sources.userId, user.id)));

  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(source);
}

/**
 * PATCH /api/sources/:id — Update a source (title, content, etc).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await req.json();

  // Map frontend "content" field to DB "plainText" column
  const updateData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.content !== undefined) updateData.plainText = body.content;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;

  const [updated] = await db
    .update(sources)
    .set(updateData)
    .where(and(eq(sources.id, id), eq(sources.userId, user.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

/**
 * DELETE /api/sources/:id — Soft-delete a source.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const [deleted] = await db
    .update(sources)
    .set({ status: "deleted", deletedAt: new Date().toISOString() })
    .where(and(eq(sources.id, id), eq(sources.userId, user.id)))
    .returning();

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
