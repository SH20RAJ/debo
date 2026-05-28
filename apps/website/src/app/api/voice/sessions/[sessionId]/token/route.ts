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
import { isLiveKitConfigured, issueRoomToken } from "@/server/voice/livekit";

/**
 * POST /api/voice/sessions/:sessionId/token
 * Re-issues a LiveKit token for an active voice session.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    if (!isLiveKitConfigured()) {
      return apiError("service_not_configured", 503, { service: "livekit" });
    }

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

    const issued = await issueRoomToken({
      identity: user.id,
      roomName: vs.roomName,
      displayName: user.name,
    });

    if (!issued) {
      return apiError("service_not_configured", 503, { service: "livekit" });
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "voice_session.token_refresh",
      targetType: "voice_session",
      targetId: sessionId,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: null,
    });

    return NextResponse.json({
      token: issued.token,
      url: issued.url,
      identity: issued.identity,
      roomName: vs.roomName,
    });
  });
}
