import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { decisions, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  apiError,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    let body: { status?: string; title?: string; decisionText?: string; reason?: string };
    try {
      body = await req.json();
    } catch {
      return apiError("invalid_json", 400);
    }

    const [existing] = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.id, id), eq(decisions.userId, user.id)))
      .limit(1);

    if (!existing) return apiError("not_found", 404);

    const [updated] = await db
      .update(decisions)
      .set({
        ...(body.status && { status: body.status as "active" | "changed" | "deprecated" }),
        ...(body.title && { title: body.title }),
        ...(body.decisionText && { decisionText: body.decisionText }),
        ...(body.reason !== undefined && { reason: body.reason }),
      })
      .where(eq(decisions.id, id))
      .returning();

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user } = session;

  return withErrorHandling(async () => {
    await db
      .delete(decisions)
      .where(and(eq(decisions.id, id), eq(decisions.userId, user.id)));

    return NextResponse.json({ success: true });
  });
}
