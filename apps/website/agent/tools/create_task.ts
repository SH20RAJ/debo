import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { tasks } from "@debo/db/schema";
import { newId } from "../../src/lib/api-helpers";

export default defineTool({
  description: "Create a new task.",
  inputSchema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["inbox", "todo", "doing", "done", "dismissed"]).default("todo"),
    projectId: z.string().optional(),
    relatedPersonId: z.string().optional(),
  }),
  async execute({ title, description, status, projectId, relatedPersonId }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const id = newId("task");
    const [inserted] = await db
      .insert(tasks)
      .values({
        id,
        userId,
        workspaceId,
        title,
        description: description || null,
        status,
        projectId: projectId || null,
        relatedPersonId: relatedPersonId || null,
        extractionStatus: "manual",
      })
      .returning();

    return { success: true, task: inserted };
  },
});
