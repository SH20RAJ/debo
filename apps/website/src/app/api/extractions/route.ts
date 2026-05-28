import { NextResponse } from "next/server";
import { requireSession, apiError, newId } from "@/lib/api-helpers";
import { extractMemories } from "@/server/langgraph/graphs/extraction.graph";
import { db } from "@debo/db";
import { tasks, auditLogs } from "@debo/db/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  let body: { text: string; sourceId?: string };
  try {
    body = await req.json();
  } catch {
    return apiError("invalid_json", 400);
  }

  if (!body.text?.trim()) {
    return apiError("text_required", 400);
  }

  try {
    const extraction = await extractMemories({
      userId: user.id,
      sourceId: body.sourceId,
      text: body.text,
    });

    // Create tasks from extracted task_hints
    for (const memory of extraction.memories) {
      if (memory.type === "task_hint" || memory.type === "promise" || memory.type === "reminder") {
        const taskId = newId("task");
        await db.insert(tasks).values({
          id: taskId,
          userId: user.id,
          workspaceId,
          title: memory.title,
          description: memory.content,
          status: "inbox",
          extractionStatus: "extracted_pending",
          sourceId: body.sourceId ?? null,
        }).catch(() => {});

        await db.insert(auditLogs).values({
          id: newId("audit"),
          userId: user.id,
          workspaceId,
          action: "extraction.create_task",
          targetType: "task",
          targetId: taskId,
          metadataJson: JSON.stringify({ type: memory.type, title: memory.title }),
        }).catch(() => {});
      }
    }

    return NextResponse.json(extraction, { status: 200 });
  } catch (err) {
    console.error("[extractions] graph error:", err);
    return apiError("extraction_failed", 500);
  }
}
