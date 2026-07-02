import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, and, ne, ilike, or, inArray } from "drizzle-orm";

export default defineTool({
  description: "Search and list emails from external connectors and debo mail.",
  inputSchema: z.object({
    query: z.string().optional(),
  }),
  async execute({ query }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const conditions = [
      eq(sources.userId, userId),
      inArray(sources.type, ["email", "debo_mail"]),
      ne(sources.status, "deleted"),
    ];
    if (workspaceId) {
      conditions.push(eq(sources.workspaceId, workspaceId));
    }
    if (query?.trim()) {
      conditions.push(
        or(
          ilike(sources.title, `%${query}%`),
          ilike(sources.plainText, `%${query}%`)
        )!
      );
    }

    const rows = await db
      .select({
        id: sources.id,
        type: sources.type,
        title: sources.title,
        plainText: sources.plainText,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .where(and(...conditions))
      .limit(10);

    return { emails: rows };
  },
});
