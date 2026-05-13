import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  llm,
  voice,
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { fileURLToPath } from "node:url";

import { DEBO_SYSTEM_PROMPT, createDeboRuntimeTools } from "../lib/chat/debo-tools";

const AGENT_NAME = "debo-voice";

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

  try {
    const { getMemories } = await import("../actions/memories");
    const memories = await getMemories("", 12, 0, userId);
    if (memories.success && memories.data?.length) {
      memoryContext = [
        "### DASHBOARD MEMORIES",
        ...memories.data.map((memory) => `- ${memory.content}`),
      ].join("\n");
    }
  } catch (error) {
    console.warn("[Debo Voice] Could not preload memories:", error);
  }

  return [
    DEBO_SYSTEM_PROMPT,
    "### LIVE VOICE MODE",
    "- Keep replies short enough to speak naturally.",
    "- Use simple English.",
    "- Ask one clear follow-up when it helps.",
    "- You can use memory and journal tools, but only save or remember when the user clearly asks.",
    memoryContext,
  ].filter(Boolean).join("\n\n");
}

function createLiveKitTools(userId: string) {
  const runtimeTools = createDeboRuntimeTools(userId);
  const tools: llm.ToolContext = {};

  for (const [name, runtimeTool] of Object.entries(runtimeTools)) {
    tools[name] = llm.tool({
      description: runtimeTool.description,
      parameters: runtimeTool.inputSchema as any,
      execute: async (args) => {
        try {
          return await runtimeTool.execute(args as never);
        } catch (error) {
          console.error(`[Debo Voice] Tool ${name} failed:`, error);
          return { error: error instanceof Error ? error.message : String(error) };
        }
      },
    });
  }

  return tools;
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log(`[Debo Voice] Connected to room: ${ctx.room.name}`);

    const participant = await ctx.waitForParticipant();
    const userId = readParticipantUserId(participant);
    const instructions = await buildVoiceInstructions(userId);
    const tools = createLiveKitTools(userId);

    class DeboVoiceAgent extends voice.Agent {
      async onEnter() {
        const greeting = this.session.generateReply({
          instructions: "Greet the user in one short sentence and ask what they want to talk through.",
        });
        await greeting.waitForPlayout();
      }
    }

    const realtimeModel = new openai.realtime.RealtimeModel({
      model: process.env.LIVEKIT_REALTIME_MODEL || "gpt-realtime",
      voice: process.env.LIVEKIT_VOICE || "coral",
    });

    const agent = new DeboVoiceAgent({
      id: AGENT_NAME,
      instructions,
      llm: realtimeModel,
      tools,
    });

    const session = new voice.AgentSession({
      llm: realtimeModel,
      maxToolSteps: 4,
      userAwayTimeout: 30,
    });

    session.on("error" as any, (event: unknown) => {
      console.error("[Debo Voice] Session error:", event);
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
}));
