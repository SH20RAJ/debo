import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listThreadsForUser, requireMailIdentity } from "../_lib/mail";

export async function GET(req: NextRequest) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  const folder = req.nextUrl.searchParams.get("folder") ?? "inbox";
  const threads = await listThreadsForUser(identity.user.id, folder);

  return NextResponse.json({ threads });
}
