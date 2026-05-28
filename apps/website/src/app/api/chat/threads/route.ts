import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { chatThreads } from "@debo/db/schema";
import { and, desc, eq } from "drizzle-orm";
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
