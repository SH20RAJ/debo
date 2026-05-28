import { NextResponse } from "next/server";
import { db } from "@debo/db";
import {
  deboMailAddresses,
  deboMailMessages,
  deboMailParticipants,
  deboMailThreads,
} from "@debo/db/schema";
import { eq } from "@/server/mail/drizzle";
import {
  getThreadForUser,
  isDeboAddress,
  normalizeDeboAddress,
  requireMailIdentity,
} from "../_lib/mail";

export async function POST(req: Request) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  const body = await req.json().catch(() => ({}));
  const to = normalizeDeboAddress(String(body.to ?? ""));
  const subject = String(body.subject ?? "").trim();
  const messageBody = String(body.body ?? "").trim();
  const requestedThreadId = typeof body.threadId === "string" ? body.threadId : null;

  if (!isDeboAddress(to)) {
    return NextResponse.json(
      { error: "Debo Mail only supports internal @debo.life addresses." },
      { status: 400 },
    );
  }

  if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!messageBody) return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  if (to === identity.address) {
    return NextResponse.json({ error: "Choose another Debo user to message." }, { status: 400 });
  }

  const [recipient] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.address, to))
    .limit(1);

  if (!recipient) {
    return NextResponse.json({ error: "That Debo Mail address is not claimed yet." }, { status: 404 });
  }

  let threadId = requestedThreadId;
  if (threadId) {
    const thread = await getThreadForUser(threadId, identity.user.id);
    if (!thread || thread.participant.deletedAt) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
  } else {
    threadId = crypto.randomUUID();
    await db.insert(deboMailThreads).values({
      id: threadId,
      workspaceId: identity.workspaceId,
      subject,
      createdByUserId: identity.user.id,
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.insert(deboMailParticipants).values([
      {
        id: crypto.randomUUID(),
        threadId,
        userId: identity.user.id,
        address: identity.address,
        role: "sender",
        lastReadAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        threadId,
        userId: recipient.userId,
        address: recipient.address,
        role: "recipient",
      },
    ]);
  }

  const now = new Date().toISOString();
  const [message] = await db
    .insert(deboMailMessages)
    .values({
      id: crypto.randomUUID(),
      threadId,
      senderUserId: identity.user.id,
      senderAddress: identity.address,
      recipientUserId: recipient.userId,
      recipientAddress: recipient.address,
      subject,
      body: messageBody,
      status: "delivered",
      createdAt: now,
    })
    .returning();

  await db
    .update(deboMailThreads)
    .set({ lastMessageAt: now, updatedAt: now })
    .where(eq(deboMailThreads.id, threadId));

  return NextResponse.json({ success: true, threadId, message }, { status: 201 });
}
