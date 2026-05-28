import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { deboMailMessages, deboMailParticipants } from "@debo/db/schema";
import { and, asc, eq, isNull } from "@/server/mail/drizzle";
import { getThreadForUser, requireMailIdentity } from "../../_lib/mail";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  const { threadId } = await params;
  const row = await getThreadForUser(threadId, identity.user.id);
  if (!row || row.participant.deletedAt) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(deboMailMessages)
    .where(and(eq(deboMailMessages.threadId, threadId), isNull(deboMailMessages.deletedAt)))
    .orderBy(asc(deboMailMessages.createdAt));

  const participants = await db
    .select()
    .from(deboMailParticipants)
    .where(eq(deboMailParticipants.threadId, threadId));

  const savedCount = messages.filter((message) => message.isMemorySaved === 1).length;

  return NextResponse.json({
    thread: {
      ...row.thread,
      participant: row.participant,
      lastMessage: messages.at(-1) ?? null,
      messageCount: messages.length,
      memorySavedCount: savedCount,
    },
    messages,
    context: {
      participants: participants.map((participant) => ({
        address: participant.address,
        role: participant.role,
        isYou: participant.userId === identity.user.id,
      })),
      savedCount,
      internalOnly: true,
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  const { threadId } = await params;
  const row = await getThreadForUser(threadId, identity.user.id);
  if (!row) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  await db
    .update(deboMailParticipants)
    .set({ deletedAt: new Date().toISOString() })
    .where(and(eq(deboMailParticipants.threadId, threadId), eq(deboMailParticipants.userId, identity.user.id)));

  return NextResponse.json({ success: true });
}
