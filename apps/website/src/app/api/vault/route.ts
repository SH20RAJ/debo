import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@debo/db";
import { auditLogs } from "@debo/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  apiError,
  newId,
  readJson,
  requireSession,
  withErrorHandling,
} from "@/lib/api-helpers";

const PostBodySchema = z.object({
  action: z.literal("export"),
});

/**
 * GET /api/vault
 * Returns the latest 100 audit log entries for the current user.
 */
export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const rows = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.userId, user.id),
          eq(auditLogs.workspaceId, workspaceId),
        ),
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    return NextResponse.json({ auditLog: rows });
  });
}

/**
 * POST /api/vault
 * Records an export request. The actual export job is out of scope here;
 * we record the intent for compliance.
 */
export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const raw = await readJson<unknown>(req);
    if (raw instanceof NextResponse) return raw;

    const parsed = PostBodySchema.safeParse(raw);
    if (!parsed.success) return apiError("invalid_body", 400);

    const exportId = newId("export");

    await db.insert(auditLogs).values({
      id: newId("audit"),
      userId: user.id,
      workspaceId,
      action: "vault_export_requested",
      targetType: "export",
      targetId: exportId,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      metadataJson: JSON.stringify({ requestedAt: new Date().toISOString() }),
    });

    return NextResponse.json({ exportId, status: "queued" });
  });
}
