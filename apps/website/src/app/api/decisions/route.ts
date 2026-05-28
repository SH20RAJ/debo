import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { decisions, auditLogs } from "@debo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const conditions = [
      eq(decisions.userId, user.id),
      eq(decisions.workspaceId, workspaceId),
    ];

    if (status && ["active", "changed", "deprecated"].includes(status)) {
      conditions.push(eq(decisions.status, status as "active" | "changed" | "deprecated"));
    }

    const rows = await db
      .select()
      .from(decisions)
      .where(and(...conditions))
      .orderBy(desc(decisions.createdAt));

    return NextResponse.json(rows);
  });
}

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    let body: { title?: string; decisionText?: string; reason?: string; status?: string; sourceId?: string; projectId?: string; confidence?: number; decidedAt?: string };
    try {
      body = await req.json();
    } catch {
      return apiError("invalid_json", 400);
    }

    if (!body.title || !body.decisionText) {
      return apiError("title_and_decision_text_required", 400);
    }

    const id = newId("dec");
    const [created] = await db
      .insert(decisions)
      .values({
        id,
        userId: user.id,
        workspaceId,
        title: body.title,
        decisionText: body.decisionText,
        reason: body.reason ?? null,
        status: (body.status as "active" | "changed" | "deprecated") ?? "active",
        confidence: body.confidence ?? null,
        sourceId: body.sourceId ?? null,
        projectId: body.projectId ?? null,
        decidedAt: body.decidedAt ?? null,
      })
      .returning();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "decision.create",
      targetType: "decision",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ title: body.title }),
    });

    return NextResponse.json(created, { status: 201 });
  });
}
