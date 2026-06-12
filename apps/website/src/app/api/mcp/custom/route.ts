import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { customMcpServers } from "@debo/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession, withErrorHandling, newId } from "@/lib/api-helpers";
import { z } from "zod";

export const runtime = "nodejs";

const CreateServerSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  headersJson: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    const servers = await db
      .select()
      .from(customMcpServers)
      .where(
        and(
          eq(customMcpServers.userId, user.id),
          eq(customMcpServers.workspaceId, workspaceId)
        )
      );
    return NextResponse.json(servers);
  });
}

export async function POST(req: Request) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const { user, workspaceId } = session;

  return withErrorHandling(async () => {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const parsed = CreateServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body", details: parsed.error.format() }, { status: 400 });
    }

    const { name, url, headersJson } = parsed.data;

    if (headersJson) {
      try {
        JSON.parse(headersJson);
      } catch {
        return NextResponse.json({ error: "invalid_headers_json" }, { status: 400 });
      }
    }

    const [newServer] = await db
      .insert(customMcpServers)
      .values({
        id: newId("mcp"),
        userId: user.id,
        workspaceId,
        name,
        url,
        headersJson: headersJson || null,
      })
      .returning();

    return NextResponse.json(newServer);
  });
}
