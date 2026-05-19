import { Hono } from "hono";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getAppContext } from "../lib/context";

const app = new Hono();

const sessions = new Map<string, { id: string; userId: string; roomName: string; status: string; createdAt: string }>();

app.post("/sessions", async (c) => {
  const ctx = getAppContext(c);
  const body = await c.req.json();
  const id = nanoid();
  const roomName = body.roomName ?? `debo-voice-${id}`;
  const session = { id, userId: ctx.userId, roomName, status: "active", createdAt: new Date().toISOString() };
  sessions.set(id, session);
  return c.json(session, 201);
});

app.get("/sessions", async (c) => {
  const ctx = getAppContext(c);
  return c.json([...sessions.values()].filter((s) => s.userId === ctx.userId));
});

app.post("/sessions/:id/token", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");
  const session = sessions.get(id);
  if (!session || session.userId !== ctx.userId) return c.json({ error: "Not found" }, 404);

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return c.json({ token: `lk_stub_${nanoid(32)}`, roomName: session.roomName, wsUrl: process.env.LIVEKIT_URL ?? "wss://debo.livekit.cloud" });
  }

  try {
    const { AccessToken } = await import("livekit-server-sdk");
    const at = new AccessToken(apiKey, apiSecret, { identity: ctx.userId, name: ctx.user.name });
    at.addGrant({ roomJoin: true, room: session.roomName, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();
    return c.json({ token, roomName: session.roomName, wsUrl: process.env.LIVEKIT_URL });
  } catch (e: any) {
    return c.json({ error: "Token generation failed", details: e.message }, 500);
  }
});

export default app;
