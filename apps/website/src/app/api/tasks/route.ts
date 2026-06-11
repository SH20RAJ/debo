import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { tasks, auditLogs } from "@debo/db/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const TaskStatusSchema = z.enum(["inbox", "todo", "doing", "done", "dismissed"]);

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueAt: z.string().optional().nullable(),
  status: TaskStatusSchema.optional(),
  projectId: z.string().optional().nullable(),
  relatedPersonId: z.string().optional().nullable(),
});

/**
 * GET /api/tasks?status=todo|doing|done|inbox|dismissed&extractionStatus=manual|extracted_pending|extracted_approved|rejected
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const extStatusParam = url.searchParams.get("extractionStatus");

    const conditions = [
      eq(tasks.userId, user.id),
      eq(tasks.workspaceId, workspaceId),
    ];

    if (statusParam) {
      const parsed = TaskStatusSchema.safeParse(statusParam);
      if (!parsed.success) return apiError("invalid_status", 400);
      conditions.push(eq(tasks.status, parsed.data));
    }

    if (extStatusParam) {
      const parsedExt = z
        .enum(["manual", "extracted_pending", "extracted_approved", "rejected"])
        .safeParse(extStatusParam);
      if (parsedExt.success) {
        conditions.push(eq(tasks.extractionStatus, parsedExt.data));
      }
    }

    const rows = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(sql`${tasks.dueAt} asc nulls last`, desc(tasks.createdAt));

    return NextResponse.json(rows);
  });
}

/**
 * POST /api/tasks
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = CreateTaskSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const id = newId("task");
    const [created] = await db
      .insert(tasks)
      .values({
        id,
        userId: user.id,
        workspaceId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        dueAt: parsed.data.dueAt ?? null,
        status: parsed.data.status ?? "inbox",
        projectId: parsed.data.projectId ?? null,
        relatedPersonId: parsed.data.relatedPersonId ?? null,
        extractionStatus: "manual",
      })
      .returning();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "task.create",
      targetType: "task",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ title: parsed.data.title }),
    });

    return NextResponse.json(created, { status: 201 });
  });
}
