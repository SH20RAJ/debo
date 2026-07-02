import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { tasks } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Search and list all user tasks.",
  inputSchema: z.object({
    status: z.enum(["inbox", "todo", "doing", "done", "dismissed"]).optional(),
  }),
  async execute({ status }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const conditions = [eq(tasks.userId, userId)];
    if (workspaceId) {
      conditions.push(eq(tasks.workspaceId, workspaceId));
    }
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const rows = await db
      .select()
      .from(tasks)
      .where(and(...conditions));

    return { tasks: rows };
  },
});
