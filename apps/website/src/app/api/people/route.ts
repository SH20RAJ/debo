import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { people, personMentions, auditLogs } from "@debo/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const CreatePersonSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/people
 * Lists people with mention count.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const rows = await db
      .select({
        id: people.id,
        userId: people.userId,
        workspaceId: people.workspaceId,
        name: people.name,
        aliasesJson: people.aliasesJson,
        relationship: people.relationship,
        company: people.company,
        role: people.role,
        notes: people.notes,
        lastMentionedAt: people.lastMentionedAt,
        createdAt: people.createdAt,
        updatedAt: people.updatedAt,
        mentionCount: sql<number>`coalesce(count(${personMentions.id}), 0)::int`,
      })
      .from(people)
      .leftJoin(personMentions, eq(personMentions.personId, people.id))
      .where(
        and(
          eq(people.userId, user.id),
          eq(people.workspaceId, workspaceId),
        ),
      )
      .groupBy(people.id)
      .orderBy(
        sql`${people.lastMentionedAt} desc nulls last`,
        asc(people.name),
      );

    return NextResponse.json(rows);
  });
}

/**
 * POST /api/people
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = CreatePersonSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const id = newId("pers");
    const [created] = await db
      .insert(people)
      .values({
        id,
        userId: user.id,
        workspaceId,
        name: parsed.data.name,
        relationship: parsed.data.relationship ?? null,
        company: parsed.data.company ?? null,
        role: parsed.data.role ?? null,
        notes: parsed.data.notes ?? null,
      })
      .returning();

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "person.create",
      targetType: "person",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ name: parsed.data.name }),
    });

    return NextResponse.json(created, { status: 201 });
  });
}
