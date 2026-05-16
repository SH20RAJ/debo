import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from "@livekit/agents";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as openai from "@livekit/agents-plugin-openai";
import { config as loadEnv } from "dotenv";
import { and, desc, eq, like } from "drizzle-orm";
import { fileURLToPath } from "node:url";

import { memoryEntities, memoryFacts } from "../db/schema";
import { DEBO_SYSTEM_PROMPT } from "../lib/chat/debo-tools";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });
loadEnv({ path: ".dev.vars", override: false });

const AGENT_NAME = "debo-voice";
const SETTINGS_FACT_PREFIX = "debo_settings:";
const warnedVoiceScopes = new Set<string>();

type VoiceSettings = {
  assistantName: string;
  userDisplayName: string;
  tone: string;
};

const defaultVoiceSettings: VoiceSettings = {
  assistantName: "Debo",
  userDisplayName: "",
  tone: "warm",
};

function summarizeError(error: unknown) {
  const value = error as {
    code?: unknown;
    message?: unknown;
    body?: { message?: unknown };
    error?: { body?: { message?: unknown }; message?: unknown; statusCode?: unknown };
    sourceError?: { cause?: { code?: unknown }; message?: unknown };
    cause?: { code?: unknown; message?: unknown };
  };

  const code =
    value?.code ||
    value?.error?.statusCode ||
    value?.sourceError?.cause?.code ||
    value?.cause?.code;
  const message =
    value?.body?.message ||
    value?.error?.body?.message ||
    value?.error?.message ||
    value?.message ||
    value?.sourceError?.message ||
    value?.cause?.message ||
    String(error);

  return [code, message].filter(Boolean).join(" ");
}

function logVoiceIssue(scope: string, error: unknown) {
  if (warnedVoiceScopes.has(scope)) return;
  warnedVoiceScopes.add(scope);
  console.warn(`[Debo Voice] ${scope} unavailable: ${summarizeError(error)}`);
}

function sanitizeSettingText(value: unknown, fallback: string, max = 64) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return text ? text.slice(0, max) : fallback;
}

function parseVoiceSettings(value: string | null | undefined): VoiceSettings {
  if (!value?.startsWith(SETTINGS_FACT_PREFIX)) return defaultVoiceSettings;

  try {
    const parsed = JSON.parse(value.slice(SETTINGS_FACT_PREFIX.length)) as Partial<VoiceSettings>;
    return {
      assistantName: sanitizeSettingText(parsed.assistantName, defaultVoiceSettings.assistantName),
      userDisplayName: sanitizeSettingText(parsed.userDisplayName, defaultVoiceSettings.userDisplayName),
      tone: sanitizeSettingText(parsed.tone, defaultVoiceSettings.tone, 24),
    };
  } catch {
    return defaultVoiceSettings;
  }
}

async function withOptionalVoiceContext<T>(scope: string, task: () => Promise<T>, fallback: T) {
  let settled = false;
  const work = Promise.resolve()
    .then(task)
    .then((value) => {
      settled = true;
      return value;
    })
    .catch((error) => {
      settled = true;
      logVoiceIssue(scope, error);
      return fallback;
    });

  const timer = new Promise<T>((resolve) => {
    setTimeout(() => {
      if (!settled) {
        settled = true;
        logVoiceIssue(scope, "timed out");
        resolve(fallback);
      }
    }, Number(process.env.LIVEKIT_CONTEXT_TIMEOUT_MS || 5000));
  });

  return Promise.race([work, timer]);
}

function readParticipantUserId(participant: {
  identity: string;
  metadata?: string;
  attributes?: Record<string, string>;
}) {
  const attributeUserId = participant.attributes?.["debo.userId"];
  if (attributeUserId) return attributeUserId;

  if (participant.metadata) {
    try {
      const metadata = JSON.parse(participant.metadata) as { userId?: unknown };
      if (typeof metadata.userId === "string" && metadata.userId.trim()) {
        return metadata.userId;
      }
    } catch {
      // Ignore malformed participant metadata and use identity below.
    }
  }

  return participant.identity;
}

async function buildVoiceInstructions(userId: string) {
  let memoryContext = "";
  let settingsContext = "";

  const settings = await withOptionalVoiceContext("settings", async () => {
    const { db } = await import("../db");
    const rows = await db.query.memoryFacts.findMany({
      where: and(
        eq(memoryFacts.userId, userId),
        eq(memoryFacts.type, "setting"),
        like(memoryFacts.content, `${SETTINGS_FACT_PREFIX}%`),
      ),
      limit: 1,
    });

    return parseVoiceSettings(rows[0]?.content);
  }, defaultVoiceSettings);

  settingsContext = [
    "### USER AI SETTINGS",
    `- Assistant name: ${settings.assistantName}`,
    settings.userDisplayName ? `- User display name: ${settings.userDisplayName}` : null,
    `- Tone: ${settings.tone}`,
  ].filter(Boolean).join("\n");

  const memories = await withOptionalVoiceContext("memories", async () => {
    const { db } = await import("../db");
    const [facts, entities] = await Promise.all([
      db.query.memoryFacts.findMany({
        where: and(eq(memoryFacts.userId, userId), eq(memoryFacts.type, "fact")),
        orderBy: [desc(memoryFacts.weight), desc(memoryFacts.createdAt)],
        limit: 8,
      }),
      db.query.memoryEntities.findMany({
        where: eq(memoryEntities.userId, userId),
        orderBy: [desc(memoryEntities.frequency), desc(memoryEntities.updatedAt)],
        limit: 4,
      }),
    ]);

    return [
      ...facts.map((fact) => fact.content),
      ...entities.map((entity) => `${entity.name} (${entity.type})`),
    ].filter((item) => item.trim().length > 0);
  }, [] as string[]);

  if (memories.length > 0) {
    memoryContext = [
      "### DASHBOARD MEMORIES",
      ...memories.map((memory) => `- ${memory}`),
    ].join("\n");
  }

  return [
    DEBO_SYSTEM_PROMPT,
    settingsContext,
    "### LIVE VOICE MODE",
    "- Keep replies short enough to speak naturally.",
    "- Use simple English.",
    "- Ask one clear follow-up when it helps.",
    "- You can use memory and journal tools, but only save or remember when the user clearly asks.",
    memoryContext,
  ].filter(Boolean).join("\n\n");
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log(`[Debo Voice] Connected to room: ${ctx.room.name}`);

    const participant = await ctx.waitForParticipant();
    const userId = readParticipantUserId(participant);
    const instructions = await buildVoiceInstructions(userId);

    class DeboVoiceAgent extends voice.Agent {
      async onEnter() {
        await this.session.say("Hey, sir. I'm here. What are we taking on?");
      }
    }

    const stt = new deepgram.STT({
      apiKey: process.env.DEEPGRAM_API_KEY,
      model: (process.env.LIVEKIT_STT_MODEL || "nova-3") as any,
      language: process.env.LIVEKIT_STT_LANGUAGE || "en-US",
      smartFormat: true,
      interimResults: true,
      punctuate: true,
    });
    const llmModel = new openai.LLM({
      apiKey: process.env.LIVEKIT_LLM_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.LIVEKIT_LLM_BASE_URL || "https://integrate.api.nvidia.com/v1",
      model: process.env.LIVEKIT_LLM_MODEL || process.env.DEBO_CHAT_MODEL || "meta/llama-3.3-70b-instruct",
      temperature: 0.7,
    });
    const tts = new cartesia.TTS({
      apiKey: process.env.CARTESIA_API_KEY,
      model: process.env.LIVEKIT_TTS_MODEL || "sonic-english",
      voice: process.env.LIVEKIT_VOICE || "694f9389-aac1-45b6-b726-9d9369183238",
    });

    const agent = new DeboVoiceAgent({
      id: AGENT_NAME,
      instructions,
    });

    const session = new voice.AgentSession({
      stt,
      llm: llmModel,
      tts,
      maxToolSteps: 4,
      userAwayTimeout: 30,
    });

    session.on("error" as any, (event: unknown) => {
      console.error(`[Debo Voice] Session error: ${summarizeError(event)}`);
    });

    session.on("agent_state_changed" as any, (event: any) => {
      console.log(`[Debo Voice] Agent state: ${event.oldState} -> ${event.newState}`);
    });

    session.on("user_input_transcribed" as any, (event: any) => {
      if (event.isFinal) console.log(`[Debo Voice] User: ${event.transcript}`);
    });

    await session.start({
      agent,
      room: ctx.room,
      inputOptions: {
        audioEnabled: true,
        textEnabled: true,
        videoEnabled: false,
        participantIdentity: participant.identity,
      },
      outputOptions: {
        audioEnabled: true,
        transcriptionEnabled: true,
        syncTranscription: true,
      },
    });

    console.log(`[Debo Voice] Session active for user: ${userId}`);
  },
});

cli.runApp(new ServerOptions({
  agent: fileURLToPath(import.meta.url),
  agentName: AGENT_NAME,
  port: Number(process.env.LIVEKIT_AGENT_PORT || 8081),
}));
