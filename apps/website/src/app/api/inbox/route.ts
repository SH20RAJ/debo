import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { tasks, memoryItems, sources } from "@debo/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { requireSession, withErrorHandling } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    // 1. Fetch tasks in inbox
    const taskRows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        confidence: tasks.confidence,
        createdAt: tasks.createdAt,
        sourceId: tasks.sourceId,
        sourceTitle: sources.title,
        sourceType: sources.type,
      })
      .from(tasks)
      .leftJoin(sources, eq(tasks.sourceId, sources.id))
      .where(
        and(
          eq(tasks.userId, user.id),
          eq(tasks.workspaceId, workspaceId),
          eq(tasks.status, "inbox")
        )
      );

    // 2. Fetch memory items needing review
    const memoryRows = await db
      .select({
        id: memoryItems.id,
        type: memoryItems.type,
        title: memoryItems.title,
        content: memoryItems.content,
        confidence: memoryItems.confidence,
        reviewStatus: memoryItems.reviewStatus,
        createdAt: memoryItems.createdAt,
        sourceId: memoryItems.sourceId,
        sourceTitle: sources.title,
        sourceType: sources.type,
      })
      .from(memoryItems)
      .leftJoin(sources, eq(memoryItems.sourceId, sources.id))
      .where(
        and(
          eq(memoryItems.userId, user.id),
          eq(memoryItems.workspaceId, workspaceId),
          eq(memoryItems.reviewStatus, "needs_review")
        )
      );

    // 3. Map to unified format
    const unifiedTasks = taskRows.map((t) => ({
      id: t.id,
      table: "tasks" as const,
      type: "task" as const,
      content: t.title || t.description || "Untitled Task",
      source: (t.sourceType || "journal") as any,
      sourceLabel: t.sourceTitle || "Inbox",
      confidence: t.confidence !== null ? (t.confidence >= 0.7 ? "Strong" : t.confidence >= 0.4 ? "Partial" : "Weak") : "Strong",
      createdAt: t.createdAt,
    }));

    const unifiedMemories = memoryRows.map((m) => {
      let type: "task" | "person" | "promise" | "fact" | "decision" = "fact";
      if (m.type === "task_hint" || m.type === "reminder") {
        type = "task";
      } else if (m.type === "promise") {
        type = "promise";
      } else if (m.type === "decision") {
        type = "decision";
      }
      
      return {
        id: m.id,
        table: "memory_items" as const,
        type,
        content: m.content || m.title || "Untitled Extraction",
        source: (m.sourceType || "journal") as any,
        sourceLabel: m.sourceTitle || "Inbox",
        confidence: m.confidence !== null ? (m.confidence >= 0.7 ? "Strong" : m.confidence >= 0.4 ? "Partial" : "Weak") : "Strong",
        createdAt: m.createdAt,
      };
    });

    const unifiedList = [...unifiedTasks, ...unifiedMemories].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(unifiedList);
  });
}
