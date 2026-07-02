import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { projects } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Update details of an existing project.",
  inputSchema: z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["active", "paused", "archived"]).optional(),
    color: z.string().optional(),
  }),
  async execute({ id, name, description, status, color }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (color !== undefined) updates.color = color;

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, userId),
          eq(projects.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!updated) {
      return { error: "Project not found or access denied." };
    }

    return { success: true, project: updated };
  },
});
