import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { chatThreads, chatMessages, answerCitations, sources } from "@debo/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  apiError,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

/**
 * GET /api/chat/threads/:threadId
 * Returns the thread + ordered messages + citations grouped per message.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { threadId } = await params;

    const [thread] = await db
      .select()
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!thread) return apiError("not_found", 404);

    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.threadId, threadId),
          eq(chatMessages.userId, user.id),
        ),
      )
      .orderBy(asc(chatMessages.createdAt));

    const messageIds = messages.map((m) => m.id);

    let citations: any[] = [];
    if (messageIds.length > 0) {
      citations = await db
        .select({
          id: answerCitations.id,
          messageId: answerCitations.messageId,
          sourceId: answerCitations.sourceId,
          quoteText: answerCitations.quoteText,
          confidence: answerCitations.confidence,
          sourceType: sources.type,
          sourceTitle: sources.title,
        })
        .from(answerCitations)
        .innerJoin(sources, eq(answerCitations.sourceId, sources.id))
        .where(
          and(
            eq(answerCitations.workspaceId, workspaceId),
            eq(answerCitations.userId, user.id),
            inArray(answerCitations.messageId, messageIds),
          ),
        );
    }

    const citationsByMessage = new Map<string, any[]>();
    for (const c of citations) {
      const list = citationsByMessage.get(c.messageId) ?? [];
      list.push(c);
      citationsByMessage.set(c.messageId, list);
    }

    return NextResponse.json({
      thread,
      messages: messages.map((m) => ({
        ...m,
        citations: citationsByMessage.get(m.id) ?? [],
      })),
    });
  });
}

/**
 * PATCH /api/chat/threads/:threadId
 * Renames a thread.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { threadId } = await params;
    let body: { title?: string };
    try {
      body = await req.json();
    } catch {
      return apiError("invalid_json", 400);
    }

    const title = (body.title ?? "").trim();
    if (!title) return apiError("title_required", 400);

    const [updated] = await db
      .update(chatThreads)
      .set({ title, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updated) return apiError("not_found", 404);

    return NextResponse.json(updated);
  });
}

/**
 * DELETE /api/chat/threads/:threadId
 * Deletes a thread and cascades deletes messages and citations.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { threadId } = await params;

    // Confirm ownership
    const [thread] = await db
      .select()
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, user.id),
          eq(chatThreads.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!thread) return apiError("not_found", 404);

    // 1. Fetch message IDs of this thread to clean up citations
    const messages = await db
      .select({ id: chatMessages.id })
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadId));

    const messageIds = messages.map((m) => m.id);

    if (messageIds.length > 0) {
      await db
        .delete(answerCitations)
        .where(inArray(answerCitations.messageId, messageIds));
    }

    // 2. Delete messages
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.threadId, threadId));

    // 3. Delete thread
    await db
      .delete(chatThreads)
      .where(eq(chatThreads.id, threadId));

    return NextResponse.json({ success: true });
  });
}
