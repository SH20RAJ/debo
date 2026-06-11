import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { sources, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import { indexSource } from "@/server/ingestion";

const PatchSourceSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  status: z
    .enum(["draft", "uploaded", "processing", "ready", "needs_review", "failed"])
    .optional(),
  metadataJson: z.string().optional().nullable(),
});

/**
 * GET /api/sources/:id
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const [row] = await db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.id, id),
          eq(sources.userId, user.id),
          eq(sources.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!row) return apiError("not_found", 404);
    return NextResponse.json(row);
  });
}

/**
 * PATCH /api/sources/:id
 * If `content` changes, the source is re-indexed.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = PatchSourceSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    let contentChanged = false;
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.content !== undefined) {
      updates.plainText = parsed.data.content;
      contentChanged = true;
    }
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.metadataJson !== undefined) updates.metadataJson = parsed.data.metadataJson;

    const [updated] = await db
      .update(sources)
      .set(updates)
      .where(
        and(
          eq(sources.id, id),
          eq(sources.userId, user.id),
          eq(sources.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updated) return apiError("not_found", 404);

    if (contentChanged) {
      indexSource({
        sourceId: updated.id,
        userId: user.id,
        workspaceId,
        plainText: updated.plainText,
      }).catch((err) => console.error("[sources] re-index failed", err));
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "source.update",
      targetType: "source",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ contentChanged }),
    });

    return NextResponse.json(updated);
  });
}

/**
 * DELETE /api/sources/:id
 * Soft-delete; vectors are pruned by the next index pass on ID re-use.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const [deleted] = await db
      .update(sources)
      .set({
        status: "deleted",
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(sources.id, id),
          eq(sources.userId, user.id),
          eq(sources.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!deleted) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "source.delete",
      targetType: "source",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: null,
    });

    return new NextResponse(null, { status: 204 });
  });
}
