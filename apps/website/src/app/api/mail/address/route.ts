import { NextResponse } from "next/server";
import { requireMailIdentity } from "../_lib/mail";

export async function GET(req: Request) {
  const identity = await requireMailIdentity(req);
  if (identity instanceof NextResponse) return identity;

  return NextResponse.json({
    username: identity.username,
    address: identity.address,
  });
}
