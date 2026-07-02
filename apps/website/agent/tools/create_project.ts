import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { projects } from "@debo/db/schema";
import { newId } from "../../src/lib/api-helpers";

export default defineTool({
  description: "Create a new project.",
  inputSchema: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["active", "paused", "archived"]).default("active"),
    color: z.string().optional(),
  }),
  async execute({ name, description, status, color }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const id = newId("proj");
    const [inserted] = await db
      .insert(projects)
      .values({
        id,
        userId,
        workspaceId,
        name,
        description: description || null,
        status,
        color: color || null,
        extractionStatus: "manual",
      })
      .returning();

    return { success: true, project: inserted };
  },
});
