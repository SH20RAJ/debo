import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { tasks, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

/**
 * POST /api/tasks/:id/dismiss
 * Dismisses an extracted task: status -> "dismissed", extractionStatus -> "rejected"
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;

    const [updated] = await db
      .update(tasks)
      .set({
        status: "dismissed",
        extractionStatus: "rejected",
        updatedAt: new Date().toISOString(),
      })
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
      action: "task.dismiss",
      targetType: "task",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: null,
    });

    return NextResponse.json(updated);
  });
}
