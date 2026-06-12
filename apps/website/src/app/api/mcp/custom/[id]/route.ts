import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { customMcpServers } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession, withErrorHandling } from "@/lib/api-helpers";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;

    const [deleted] = await db
      .delete(customMcpServers)
      .where(
        and(
          eq(customMcpServers.id, id),
          eq(customMcpServers.userId, user.id),
          eq(customMcpServers.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  });
}
