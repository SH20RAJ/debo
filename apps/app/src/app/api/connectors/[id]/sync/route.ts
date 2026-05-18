import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/actions/auth-sync";
import { deleteConnector, syncConnector } from "@/actions/connectors";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await resolveUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteConnector(userId, id);

  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await resolveUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncConnector(userId, id);

  if (!result.success && result.error) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
