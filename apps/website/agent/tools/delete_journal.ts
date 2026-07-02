import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Delete a journal entry.",
  inputSchema: z.object({
    id: z.string().min(1),
  }),
  async execute({ id }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const [deleted] = await db
      .update(sources)
      .set({
        status: "deleted",
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(sources.id, id),
          eq(sources.userId, userId),
          eq(sources.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      return { error: "Journal entry not found or access denied." };
    }

    return { success: true, message: "Journal entry deleted successfully." };
  },
});
