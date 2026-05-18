import { AccessToken, RoomAgentDispatch, RoomConfiguration } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { resolveUserId } from "@/actions/auth-sync";

export const dynamic = "force-dynamic";

const LIVEKIT_AGENT_NAME = process.env.LIVEKIT_AGENT_NAME || "debo-voice";

function toRoomSafeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 72);
}

function toHttpLiveKitUrl(value: string) {
  if (value.startsWith("wss://")) return value.replace("wss://", "https://");
  if (value.startsWith("ws://")) return value.replace("ws://", "http://");
  return value;
}

function toWebSocketLiveKitUrl(value: string) {
  if (value.startsWith("https://")) return value.replace("https://", "wss://");
  if (value.startsWith("http://")) return value.replace("http://", "ws://");
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
    const configuredServerUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !configuredServerUrl) {
      return NextResponse.json(
        { error: "LiveKit is not configured" },
        { status: 500 },
      );
    }

    const serverUrl = toWebSocketLiveKitUrl(configuredServerUrl);
    const roomConfig = new RoomConfiguration({ name: roomName });
    roomConfig.agents = [
      new RoomAgentDispatch({
        agentName: LIVEKIT_AGENT_NAME,
        metadata,
      }),
    ];

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: "10m",
      metadata,
      attributes: {
        "debo.userId": userId,
      },
    });
    at.roomConfig = roomConfig;

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
      serverApiUrl: toHttpLiveKitUrl(serverUrl),
      roomName,
      participantName,
      agentName: LIVEKIT_AGENT_NAME,
      agentDispatchStatus: "requested",
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
