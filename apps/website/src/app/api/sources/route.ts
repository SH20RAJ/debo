import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { sources, auditLogs } from "@debo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";
import { indexSource } from "@/server/ingestion";

const SOURCE_TYPES = [
  "journal", "voice", "audio", "video", "file", "image",
  "link", "email", "debo_mail", "calendar", "notion",
  "github", "call", "manual",
] as const;

const CreateSourceSchema = z.object({
  type: z.enum(SOURCE_TYPES).optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  origin: z.enum(["manual", "upload", "connector", "livekit", "import"]).optional(),
  status: z.enum(["draft", "uploaded", "processing", "ready", "needs_review", "failed"]).optional(),
  originalUrl: z.string().url().optional().nullable(),
});

/**
 * GET /api/sources?type=journal
 * Lists non-deleted sources for the user.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const conditions = [
      eq(sources.userId, user.id),
      eq(sources.workspaceId, workspaceId),
    ];
    if (type) {
      const parsed = z.enum(SOURCE_TYPES).safeParse(type);
      if (!parsed.success) return apiError("invalid_type", 400);
      conditions.push(eq(sources.type, parsed.data));
    }

    const rows = await db
      .select()
      .from(sources)
      .where(and(...conditions))
      .orderBy(desc(sources.createdAt));

    return NextResponse.json(rows);
  });
}

/**
 * POST /api/sources
 * Create a new source. If `content` is provided, it is indexed asynchronously
 * (chunked, embedded if Qdrant is configured, and persisted as memory_chunks).
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = CreateSourceSchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);
    const data = parsed.data;

    const id = newId("src");
    const [created] = await db
      .insert(sources)
      .values({
        id,
        userId: user.id,
        workspaceId,
        type: data.type ?? "manual",
        title: data.title ?? "Untitled",
        description: data.description ?? null,
        plainText: data.content ?? null,
        status: data.status ?? (data.content ? "ready" : "draft"),
        origin: data.origin ?? "manual",
        originalUrl: data.originalUrl ?? null,
      })
      .returning();

    // Best-effort ingestion. Don't block create if vector infra is down.
    if (created?.plainText) {
      indexSource({
        sourceId: created.id,
        userId: user.id,
        workspaceId,
        plainText: created.plainText,
      }).catch((err) => console.error("[sources] index failed", err));
    }

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "source.create",
      targetType: "source",
      targetId: id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ type: created!.type, title: created!.title }),
    });

    return NextResponse.json(created, { status: 201 });
  });
}
