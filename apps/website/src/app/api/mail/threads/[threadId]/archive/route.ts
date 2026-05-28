import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { deboMailParticipants } from "@debo/db/schema";
import { and, eq } from "@/server/mail/drizzle";
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

  const archivedAt = row.participant.archivedAt ? null : new Date().toISOString();

  await db
    .update(deboMailParticipants)
    .set({ archivedAt })
    .where(and(eq(deboMailParticipants.threadId, threadId), eq(deboMailParticipants.userId, identity.user.id)));

  return NextResponse.json({ success: true, archived: Boolean(archivedAt) });
}
