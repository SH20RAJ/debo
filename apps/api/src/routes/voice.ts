import { Hono } from "hono";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getAppContext } from "../lib/context";
import { parseBody } from "../lib/validate";

const voiceRouter = new Hono();

// In-memory session store — replace with DB table when voice is fully integrated
const sessions = new Map<string, {
  id: string;
  userId: string;
  roomName: string;
  status: string;
  createdAt: string;
}>();

const createSessionSchema = z.object({
  roomName: z.string().min(1).max(200).optional(),
});

// POST /sessions — create voice session
voiceRouter.post("/sessions", async (c) => {
  const ctx = getAppContext(c);
  const body = await parseBody(c, createSessionSchema);

  const id = nanoid();
  const roomName = body.roomName ?? `debo-voice-${id}`;

  const session = {
    id,
    userId: ctx.userId,
    roomName,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  sessions.set(id, session);
  return c.json({ session }, 201);
});

// GET /sessions — list voice sessions
voiceRouter.get("/sessions", async (c) => {
  const ctx = getAppContext(c);
  const userSessions = [...sessions.values()].filter((s) => s.userId === ctx.userId);
  return c.json({ sessions: userSessions });
});

// POST /sessions/:id/token — generate LiveKit token (stub)
voiceRouter.post("/sessions/:id/token", async (c) => {
  const ctx = getAppContext(c);
  const id = c.req.param("id");

  const session = sessions.get(id);
  if (!session || session.userId !== ctx.userId) {
    return c.json({ error: "Session not found" }, 404);
  }

  // TODO: Generate real LiveKit token using LiveKit server SDK
  return c.json({
    token: `lk_stub_${nanoid(32)}`,
    roomName: session.roomName,
    wsUrl: process.env.LIVEKIT_URL ?? "wss://debo.livekit.cloud",
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  });
});

export default voiceRouter;
