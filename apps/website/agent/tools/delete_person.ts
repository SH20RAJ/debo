import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { people } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Delete a contact (person) from the database.",
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
      .delete(people)
      .where(
        and(
          eq(people.id, id),
          eq(people.userId, userId),
          eq(people.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      return { error: "Contact not found or access denied." };
    }

    return { success: true, message: "Contact deleted successfully." };
  },
});
