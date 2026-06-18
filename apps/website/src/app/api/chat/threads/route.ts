import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { chatThreads, chatMessages, answerCitations } from "@debo/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireSession, withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/chat/threads
 * Lists the user's chat threads, newest first.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const rows = await db
      .select()
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(chatThreads.updatedAt))
      .limit(50);

    return NextResponse.json(rows);
  });
}

/**
 * DELETE /api/chat/threads
 * Deletes all chat threads (messages & citations) for this user/workspace.
 */
export async function DELETE(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    // 1. Fetch all thread IDs of this user
    const threads = await db
      .select({ id: chatThreads.id })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspaceId),
        ),
      );

    const threadIds = threads.map((t) => t.id);
    if (threadIds.length > 0) {
      // 2. Fetch all message IDs across these threads
      const messages = await db
        .select({ id: chatMessages.id })
        .from(chatMessages)
        .where(inArray(chatMessages.threadId, threadIds));

      const messageIds = messages.map((m) => m.id);

      // Clean up citations first
      if (messageIds.length > 0) {
        await db
          .delete(answerCitations)
          .where(inArray(answerCitations.messageId, messageIds));
      }

      // Clean up messages
      await db
        .delete(chatMessages)
        .where(inArray(chatMessages.threadId, threadIds));

      // Clean up threads
      await db
        .delete(chatThreads)
        .where(inArray(chatThreads.id, threadIds));
    }

    return NextResponse.json({ success: true });
  });
}
