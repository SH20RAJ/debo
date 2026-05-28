import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { projects, auditLogs } from "@debo/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

/**
 * GET /api/projects
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const rows = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, user.id),
          eq(projects.workspaceId, workspaceId),
        ),
      )
      .orderBy(asc(projects.status), desc(projects.updatedAt));

    return NextResponse.json(rows);
  });
}

/**
 * POST /api/projects
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = CreateProjectSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const id = newId("proj");
    const [created] = await db
      .insert(projects)
      .values({
        id,
        userId: user.id,
        workspaceId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        color: parsed.data.color ?? null,
        status: "active",
      })
      .returning();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "project.create",
      targetType: "project",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ name: parsed.data.name }),
    });

    return NextResponse.json(created, { status: 201 });
  });
}
