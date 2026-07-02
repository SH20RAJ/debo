import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, and, ne, ilike, or } from "drizzle-orm";

export default defineTool({
  description: "Search and list all journal entries.",
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
      eq(sources.type, "journal"),
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
        title: sources.title,
        plainText: sources.plainText,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .where(and(...conditions))
      .limit(10);

    return { journals: rows };
  },
});
