import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { chatThreads, chatMessages, answerCitations, sources } from "@debo/db/schema";
import { and, asc, eq } from "drizzle-orm";
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

    const citations = await db
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
        ),
      );

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
