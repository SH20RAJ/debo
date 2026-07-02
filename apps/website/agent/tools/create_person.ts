import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { people } from "@debo/db/schema";
import { newId } from "../../src/lib/api-helpers";

export default defineTool({
  description: "Create a new contact (person).",
  inputSchema: z.object({
    name: z.string().min(1),
    relationship: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    notes: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  async execute({ name, relationship, company, role, notes, email, phone }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const id = newId("person");
    const [inserted] = await db
      .insert(people)
      .values({
        id,
        userId,
        workspaceId,
        name,
        relationship: relationship || null,
        company: company || null,
        role: role || null,
        notes: notes || null,
        email: email || null,
        phone: phone || null,
      })
      .returning();

    return { success: true, person: inserted };
  },
});
