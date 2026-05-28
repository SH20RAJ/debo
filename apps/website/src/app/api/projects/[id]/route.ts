import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { projects, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const PatchProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "archived"]).optional(),
});

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
      .from(projects)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, user.id),
          eq(projects.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!row) return apiError("not_found", 404);
    return NextResponse.json(row);
  });
}

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

    const parsed = PatchProjectSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    for (const key of ["name", "description", "color", "status"] as const) {
      if (parsed.data[key] !== undefined) updates[key] = parsed.data[key];
    }

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, user.id),
          eq(projects.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updated) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "project.update",
      targetType: "project",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const [archived] = await db
      .update(projects)
      .set({ status: "archived", updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, user.id),
          eq(projects.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!archived) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "project.archive",
      targetType: "project",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: null,
    });

    return new NextResponse(null, { status: 204 });
  });
}
