import { defineTool } from "eve/tools";
import { z } from "zod";
import { db } from "@debo/db";
import { people } from "@debo/db/schema";
import { eq, and } from "drizzle-orm";

export default defineTool({
  description: "Update details of an existing contact (person).",
  inputSchema: z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    relationship: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    notes: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  async execute({ id, name, relationship, company, role, notes, email, phone }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    const workspaceId = ctx.session.auth.current?.attributes?.workspaceId as string;
    if (!userId) {
      return { error: "Unauthenticated" };
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (name !== undefined) updates.name = name;
    if (relationship !== undefined) updates.relationship = relationship;
    if (company !== undefined) updates.company = company;
    if (role !== undefined) updates.role = role;
    if (notes !== undefined) updates.notes = notes;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    const [updated] = await db
      .update(people)
      .set(updates)
      .where(
        and(
          eq(people.id, id),
          eq(people.userId, userId),
          eq(people.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!updated) {
      return { error: "Contact not found or access denied." };
    }

    return { success: true, person: updated };
  },
});
