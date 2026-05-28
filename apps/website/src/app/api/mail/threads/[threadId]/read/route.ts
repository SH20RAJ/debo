import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { deboMailMessages, deboMailParticipants } from "@debo/db/schema";
import { and, eq, isNull } from "@/server/mail/drizzle";
import { getThreadForUser, requireMailIdentity } from "../../../_lib/mail";

export async function POST(
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

  const now = new Date().toISOString();

  await db
    .update(deboMailParticipants)
    .set({ lastReadAt: now })
    .where(and(eq(deboMailParticipants.threadId, threadId), eq(deboMailParticipants.userId, identity.user.id)));

  await db
    .update(deboMailMessages)
    .set({ status: "read", readAt: now })
    .where(
      and(
        eq(deboMailMessages.threadId, threadId),
        eq(deboMailMessages.recipientUserId, identity.user.id),
        isNull(deboMailMessages.readAt),
      ),
    );

  return NextResponse.json({ success: true });
}
