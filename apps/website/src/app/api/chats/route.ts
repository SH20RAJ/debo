import { NextResponse } from "next/server";
import { listChatsPageByUser } from "@/app/agents/lib/db/queries";
import { getServerViewer } from "@/app/agents/lib/session";
import { getSetupStatus } from "@/app/agents/lib/setup";

export async function GET(request: Request) {
  const setupStatus = await getSetupStatus();

  if (!setupStatus.appReady) {
    return NextResponse.json({ chats: [], nextCursor: null });
  }

  const viewer = await getServerViewer(setupStatus);

  if (!viewer) {
    return NextResponse.json({ chats: [], nextCursor: null }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = await listChatsPageByUser(viewer.id, searchParams.get("cursor"));

  return NextResponse.json({
    chats: page.items,
    nextCursor: page.nextCursor,
  });
}
