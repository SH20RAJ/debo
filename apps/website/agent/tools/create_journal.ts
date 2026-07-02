import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { newId } from "../../src/lib/api-helpers";

export default defineTool({
  description: "Create a new journal entry.",
  inputSchema: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  }),
  async execute({ title, content }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const id = newId("src");
    const [inserted] = await db
      .insert(sources)
      .values({
        id,
        userId,
        workspaceId,
        type: "journal",
        title,
        plainText: content,
        status: "ready",
        origin: "manual",
      })
      .returning();

    return { success: true, journal: inserted };
  },
});
