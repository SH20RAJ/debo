import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { projects } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Delete/Archive a project.",
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
      .update(projects)
      .set({
        status: "archived",
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, userId),
          eq(projects.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      return { error: "Project not found or access denied." };
    }

    return { success: true, message: "Project deleted/archived successfully." };
  },
});
