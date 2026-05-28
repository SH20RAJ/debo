import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { voiceSessions, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

/**
 * POST /api/voice/sessions/:sessionId/end
 * Marks an active session completed and records duration.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { sessionId } = await params;

    const [vs] = await db
      .select()
      .from(voiceSessions)
      .where(
        and(
          eq(voiceSessions.id, sessionId),
          eq(voiceSessions.userId, user.id),
          eq(voiceSessions.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!vs) return apiError("not_found", 404);
    if (vs.status !== "active") return apiError("session_not_active", 409);

    const endedAt = new Date();
    const startedAt = vs.startedAt ? new Date(vs.startedAt) : endedAt;
    const durationSeconds = Math.max(
      0,
      Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
    );

    const [updated] = await db
      .update(voiceSessions)
      .set({
        status: "completed",
        endedAt: endedAt.toISOString(),
        durationSeconds,
      })
      .where(eq(voiceSessions.id, sessionId))
      .returning();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "voice_session.end",
      targetType: "voice_session",
      targetId: sessionId,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ durationSeconds }),
    });

    return NextResponse.json(updated);
  });
}
