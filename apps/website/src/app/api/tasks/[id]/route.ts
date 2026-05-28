import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { tasks, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const PatchTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  dueAt: z.string().optional().nullable(),
  status: z
    .enum(["inbox", "todo", "doing", "done", "dismissed"])
    .optional(),
  projectId: z.string().optional().nullable(),
  relatedPersonId: z.string().optional().nullable(),
});

/**
 * PATCH /api/tasks/:id
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

    const parsed = PatchTaskSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      updates.description = parsed.data.description;
    if (parsed.data.dueAt !== undefined) updates.dueAt = parsed.data.dueAt;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.projectId !== undefined)
      updates.projectId = parsed.data.projectId;
    if (parsed.data.relatedPersonId !== undefined)
      updates.relatedPersonId = parsed.data.relatedPersonId;

    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.userId, user.id),
          eq(tasks.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updated) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "task.update",
      targetType: "task",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  });
}
