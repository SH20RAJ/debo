import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { tasks } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Delete/Dismiss a task.",
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
      .update(tasks)
      .set({
        status: "dismissed",
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.userId, userId),
          eq(tasks.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      return { error: "Task not found or access denied." };
    }

    return { success: true, message: "Task deleted/dismissed successfully." };
  },
});
