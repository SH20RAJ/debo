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
    return NextResponse.json({
      available: false,
      reason: "Use 3-32 lowercase letters, numbers, dots, underscores, or hyphens.",
    });
  }

  const [existing] = await db
    .select()
    .from(deboMailAddresses)
    .where(eq(deboMailAddresses.username, username))
    .limit(1);

  return NextResponse.json({
    available: !existing || existing.userId === identity.user.id,
    address: `${username}@debo.life`,
  });
}
