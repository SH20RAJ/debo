import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { projects, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

/**
 * POST /api/projects/:id/approve
 * Approves an extracted project: status -> "active", extractionStatus -> "extracted_approved"
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
      .update(projects)
      .set({
        status: "active",
        extractionStatus: "extracted_approved",
        updatedAt: new Date().toISOString(),
      })
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
      action: "project.approve",
      targetType: "project",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: null,
    });

    return NextResponse.json(updated);
  });
}
