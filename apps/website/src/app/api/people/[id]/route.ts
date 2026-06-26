import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import {
  people,
  personMentions,
  sources,
  auditLogs,
  memoryItems,
  tasks,
} from "@debo/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const PatchPersonSchema = z.object({
  name: z.string().min(1).optional(),
  relationship: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

/**
 * GET /api/people/:id
 * Returns the person with up to 20 recent mentions joined to source titles.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;

    const [person] = await db
      .select()
      .from(people)
      .where(
        and(
          eq(people.id, id),
          eq(people.userId, user.id),
          eq(people.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!person) return apiError("not_found", 404);

    const mentions = await db
      .select({
        id: personMentions.id,
        sourceId: personMentions.sourceId,
        contextText: personMentions.contextText,
        createdAt: personMentions.createdAt,
        sourceTitle: sources.title,
        sourceType: sources.type,
      })
      .from(personMentions)
      .leftJoin(sources, eq(sources.id, personMentions.sourceId))
      .where(
        and(
          eq(personMentions.personId, id),
          eq(personMentions.userId, user.id),
          eq(personMentions.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(personMentions.createdAt))
      .limit(20);

    const promisesRows = await db
      .select({
        content: memoryItems.content,
      })
      .from(memoryItems)
      .innerJoin(personMentions, eq(personMentions.memoryItemId, memoryItems.id))
      .where(
        and(
          eq(personMentions.personId, id),
          eq(memoryItems.type, "promise"),
          eq(memoryItems.userId, user.id),
        )
      );

    const promises = promisesRows.map(r => r.content);

    const openTasksRows = await db
      .select({
        title: tasks.title,
        sourceTitle: sources.title,
      })
      .from(tasks)
      .leftJoin(sources, eq(sources.id, tasks.sourceId))
      .where(
        and(
          eq(tasks.relatedPersonId, id),
          eq(tasks.userId, user.id),
          ne(tasks.status, "done"),
          ne(tasks.status, "dismissed"),
        )
      );

    const openTasks = openTasksRows.map(r => ({
      title: r.title,
      source: r.sourceTitle ?? "Manual Entry",
    }));

    const relatedSourcesRows = await db
      .select({
        title: sources.title,
        type: sources.type,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .innerJoin(personMentions, eq(personMentions.sourceId, sources.id))
      .where(
        and(
          eq(personMentions.personId, id),
          eq(sources.userId, user.id),
        )
      )
      .orderBy(desc(sources.createdAt))
      .limit(20);

    const seenSources = new Set<string>();
    const relatedSources: any[] = [];
    for (const s of relatedSourcesRows) {
      if (!s.title || seenSources.has(s.title)) continue;
      seenSources.add(s.title);
      relatedSources.push({
        title: s.title,
        type: s.type,
        date: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
      });
    }

    return NextResponse.json({ ...person, mentions, promises, openTasks, relatedSources });
  });
}

/**
 * PATCH /api/people/:id
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = PatchPersonSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    for (const key of [
      "name",
      "relationship",
      "company",
      "role",
      "notes",
      "email",
      "phone",
      "twitter",
      "linkedin",
      "github",
      "avatarUrl",
    ] as const) {
      if (parsed.data[key] !== undefined) updates[key] = parsed.data[key];
    }

    const [updated] = await db
      .update(people)
      .set(updates)
      .where(
        and(
          eq(people.id, id),
          eq(people.userId, user.id),
          eq(people.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!updated) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "person.update",
      targetType: "person",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  });
}

/**
 * DELETE /api/people/:id
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const { id } = await params;
    const [deleted] = await db
      .delete(people)
      .where(
        and(
          eq(people.id, id),
          eq(people.userId, user.id),
          eq(people.workspaceId, workspaceId),
        ),
      )
      .returning();

    if (!deleted) return apiError("not_found", 404);

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "person.delete",
      targetType: "person",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: null,
    });

    return new NextResponse(null, { status: 204 });
  });
}