import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { resolveUserId } from "@/actions/auth-sync";

export async function GET(_req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await stackServerApp.getUser();
    const participantName = user?.displayName || "Debo User";
    const participantIdentity = userId;

    const roomName = "debo-agent-room"; // Keep this consistent for the agent to join

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit is not configured" },
        { status: 500 },
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
