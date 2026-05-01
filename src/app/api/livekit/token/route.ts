import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    const participantName = user?.displayName || "Anonymous";
    const participantIdentity =
      user?.id || `user_${Math.random().toString(36).substring(7)}`;

    const roomName = "debo-agent-room"; // Keep this consistent for the agent to join

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantIdentity,
        name: participantName,
      },
    );

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
