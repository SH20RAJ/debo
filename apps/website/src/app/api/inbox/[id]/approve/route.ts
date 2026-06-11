import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { tasks, memoryItems, auditLogs } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession, apiError, newId, withErrorHandling, readJson } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await readJson<{ table: "tasks" | "memory_items" }>(req);
    if (body instanceof NextResponse) return body;

    const table = body?.table;
    if (!table) return apiError("table_parameter_required", 400);

    let updated: any = null;

    if (table === "tasks") {
      const [row] = await db
        .update(tasks)
        .set({
          status: "todo",
          extractionStatus: "extracted_approved",
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(tasks.id, id),
            eq(tasks.userId, user.id),
            eq(tasks.workspaceId, workspaceId)
          )
        )
        .returning();
      updated = row;
    } else if (table === "memory_items") {
      const [row] = await db
        .update(memoryItems)
        .set({
          reviewStatus: "approved",
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(memoryItems.id, id),
            eq(memoryItems.userId, user.id),
            eq(memoryItems.workspaceId, workspaceId)
          )
        )
        .returning();
      updated = row;
    } else {
      return apiError("invalid_table", 400);
    }

    if (!updated) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "inbox.approve",
      targetType: table === "tasks" ? "task" : "memory_item",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ table }),
    });

    return NextResponse.json(updated);
  });
}
