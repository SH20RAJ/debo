import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { resolveUserId } from "@/actions/auth-sync";

export const dynamic = "force-dynamic";

function toRoomSafeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 72);
}

function toHttpLiveKitUrl(value: string) {
  if (value.startsWith("wss://")) return value.replace("wss://", "https://");
  if (value.startsWith("ws://")) return value.replace("ws://", "http://");
  return value;
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
    const metadata = JSON.stringify({
      userId,
      displayName: participantName,
      source: "dashboard-talk",
    });

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
      metadata,
      attributes: {
        "debo.userId": userId,
      },
    });

    at.addGrant({
      roomCreate: true,
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    let dispatchId: string | undefined;
    try {
      const dispatchClient = new AgentDispatchClient(toHttpLiveKitUrl(serverUrl), apiKey, apiSecret);
      const dispatch = await dispatchClient.createDispatch(roomName, "debo-voice", { metadata });
      dispatchId = dispatch.id;
    } catch (error) {
      console.warn("[LiveKit] Agent dispatch failed. The room can still connect if an agent worker auto-dispatches:", error);
    }

    return NextResponse.json({
      token: await at.toJwt(),
      serverUrl,
      roomName,
      participantName,
      dispatchId,
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
