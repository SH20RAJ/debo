import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { deboMailMessages } from "@debo/db/schema";
import { eq } from "@/server/mail/drizzle";
import { createMailSource, getThreadForUser, requireMailIdentity } from "../../../_lib/mail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  const { messageId } = await params;
  const [message] = await db
    .select()
    .from(deboMailMessages)
    .where(eq(deboMailMessages.id, messageId))
    .limit(1);

  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const thread = await getThreadForUser(message.threadId, identity.user.id);
  if (!thread || thread.participant.deletedAt) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const source = await createMailSource(messageId, identity.user.id, identity.workspaceId);
  if (!source) return NextResponse.json({ error: "Could not save message" }, { status: 500 });

  return NextResponse.json({ success: true, source });
}
