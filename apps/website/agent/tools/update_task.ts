import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { tasks } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Update an existing task's title, description, or status.",
  inputSchema: z.object({
    id: z.string().min(1),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["inbox", "todo", "doing", "done", "dismissed"]).optional(),
    projectId: z.string().optional(),
    relatedPersonId: z.string().optional(),
  }),
  async execute({ id, title, description, status, projectId, relatedPersonId }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (projectId !== undefined) updates.projectId = projectId;
    if (relatedPersonId !== undefined) updates.relatedPersonId = relatedPersonId;

    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.userId, userId),
          eq(tasks.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!updated) {
      return { error: "Task not found or access denied." };
    }

    return { success: true, task: updated };
  },
});
