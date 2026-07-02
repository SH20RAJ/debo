import { NextResponse } from "next/server";
import { getChatForUser } from "@/app/agents/lib/db/queries";
import { getServerViewer } from "@/app/agents/lib/session";
import { getSetupStatus } from "@/app/agents/lib/setup";

export async function GET(
  _request: Request,
  { params }: { readonly params: Promise<{ readonly id: string }> },
) {
  const setupStatus = await getSetupStatus();

  if (!setupStatus.appReady) {
    return NextResponse.json({ chat: null }, { status: 503 });
  }

  const viewer = await getServerViewer(setupStatus);

  if (!viewer) {
    return NextResponse.json({ chat: null }, { status: 401 });
  }

  const { id } = await params;
  const chat = await getChatForUser(id, viewer.id);

  if (!chat) {
    return NextResponse.json({ chat: null }, { status: 404 });
  }

  return NextResponse.json({ chat });
}
