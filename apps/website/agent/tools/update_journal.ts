import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Update an existing journal entry.",
  inputSchema: z.object({
    id: z.string().min(1),
    title: z.string().optional(),
    content: z.string().optional(),
  }),
  async execute({ id, title, content }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.plainText = content;

    const [updated] = await db
      .update(sources)
      .set(updates)
      .where(
        and(
          eq(sources.id, id),
          eq(sources.userId, userId),
          eq(sources.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!updated) {
      return { error: "Journal entry not found or access denied." };
    }

    return { success: true, journal: updated };
  },
});
