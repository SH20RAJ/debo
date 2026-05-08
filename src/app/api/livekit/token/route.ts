import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { resolveUserId } from "@/actions/auth-sync";

function toRoomSafeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 72);
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(undefined, true);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await stackServerApp.getUser();
    const participantName = user?.displayName || "Debo User";
    const participantIdentity = toRoomSafeId(userId);

    const requestedRoom = req.nextUrl.searchParams.get("room");
    const roomName = requestedRoom
      ? toRoomSafeId(requestedRoom)
      : `debo-${toRoomSafeId(userId)}`;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !serverUrl) {
      return NextResponse.json(
        { error: "LiveKit is not configured" },
        { status: 500 },
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: "10m",
    });

    at.addGrant({
      roomCreate: true,
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({
      token: await at.toJwt(),
      serverUrl,
      roomName,
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
