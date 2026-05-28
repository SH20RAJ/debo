import { NextResponse } from "next/server";
import { requireSession, apiError, newId } from "@/lib/api-helpers";
import { summarizeCall } from "@/server/langgraph/graphs/post-call-summary.graph";
import { db } from "@debo/db";
import { voiceSessions, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: { transcript: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("invalid_json", 400);
  }

  if (!body.transcript?.trim()) {
    return apiError("transcript_required", 400);
  }

  try {
    const summary = await summarizeCall({
      userId: user.id,
      title: body.title,
      transcript: body.transcript,
    });

    // Update the session as completed
    await db
      .update(voiceSessions)
      .set({
        status: "completed",
        endedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(voiceSessions.id, sessionId),
          eq(voiceSessions.userId, user.id),
        ),
      );

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "voice.summarize",
      targetType: "voice_session",
      targetId: sessionId,
      metadataJson: JSON.stringify({ title: body.title }),
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("[voice/summary] error:", err);
    return apiError("summarization_failed", 500);
  }
}
