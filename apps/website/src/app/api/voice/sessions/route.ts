import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { voiceSessions, auditLogs } from "@debo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import { isLiveKitConfigured, issueRoomToken } from "@/server/voice/livekit";

/**
 * GET /api/voice/sessions
 * Returns the latest 50 voice sessions for the user.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const rows = await db
      .select()
      .from(voiceSessions)
      .where(
        and(
          eq(voiceSessions.userId, user.id),
          eq(voiceSessions.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(voiceSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(rows);
  });
}

/**
 * POST /api/voice/sessions
 * Creates a new active voice session and issues a LiveKit token.
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    if (!isLiveKitConfigured()) {
      return apiError("service_not_configured", 503, { service: "livekit" });
    }

    const id = newId("vs");
    const roomName = `debo-voice-${id}`;
    const startedAt = new Date().toISOString();

    const [created] = await db
      .insert(voiceSessions)
      .values({
        id,
        userId: user.id,
        workspaceId,
        roomName,
        status: "active",
        startedAt,
      })
      .returning();

    const issued = await issueRoomToken({
      identity: user.id,
      roomName,
      displayName: user.name,
    });

    if (!issued) {
      return apiError("service_not_configured", 503, { service: "livekit" });
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "voice_session.create",
      targetType: "voice_session",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ roomName }),
    });

    return NextResponse.json(
      {
        id: created!.id,
        roomName: created!.roomName,
        status: created!.status,
        livekit: {
          url: issued.url,
          token: issued.token,
          identity: issued.identity,
        },
      },
      { status: 201 },
    );
  });
}
