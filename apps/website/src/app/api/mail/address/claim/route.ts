import { NextResponse } from "next/server";
import { db } from "@debo/db";
import { deboMailAddresses } from "@debo/db/schema";
import { eq } from "@/server/mail/drizzle";
import { isValidDeboUsername, normalizeUsername, requireMailIdentity } from "../../_lib/mail";

export async function POST(req: Request) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  const body = await req.json().catch(() => ({}));
  const username = normalizeUsername(String(body.username ?? ""));

  if (!isValidDeboUsername(username)) {
    return NextResponse.json({ error: "Invalid Debo Mail username" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.username, username))
    .limit(1);

  if (existing && existing.userId !== identity.user.id) {
    return NextResponse.json({ error: "That Debo Mail address is already claimed" }, { status: 409 });
  }

  const address = `${username}@debo.life`;
  const [updated] = await db
    .update(deboMailAddresses)
    .set({ username, address, updatedAt: new Date().toISOString() })
    .where(eq(deboMailAddresses.userId, identity.user.id))
    .returning();

  return NextResponse.json(updated ?? { username, address });
}
