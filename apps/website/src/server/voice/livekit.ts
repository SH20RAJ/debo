import { AccessToken } from "livekit-server-sdk";

/**
 * LiveKit access token issuer.
 *
 * Required env:
 *   - LIVEKIT_API_KEY
 *   - LIVEKIT_API_SECRET
 *   - LIVEKIT_URL                  (server URL, used by client to connect)
 *   - NEXT_PUBLIC_LIVEKIT_URL      (client-visible mirror; defaults to LIVEKIT_URL)
 */

export type LiveKitConfig = {
  apiKey: string;
  apiSecret: string;
  url: string;
};

export function getLiveKitConfig(): LiveKitConfig | null {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) return null;
  return { apiKey, apiSecret, url };
}

export type IssuedLiveKitToken = {
  token: string;
  url: string;
  roomName: string;
  identity: string;
};

export async function issueRoomToken(opts: {
  identity: string;
  roomName: string;
  displayName?: string;
  ttlSeconds?: number;
}): Promise<IssuedLiveKitToken | null> {
  const cfg = getLiveKitConfig();
  if (!cfg) return null;

  const at = new AccessToken(cfg.apiKey, cfg.apiSecret, {
    identity: opts.identity,
    name: opts.displayName,
    ttl: opts.ttlSeconds ?? 60 * 60,
  });
  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });

  const token = await at.toJwt();
  return { token, url: cfg.url, roomName: opts.roomName, identity: opts.identity };
}

export function isLiveKitConfigured(): boolean {
  return getLiveKitConfig() !== null;
}
