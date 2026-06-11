import {
  defineAgent,
  llm,
  voice,
  cli,
  type JobContext,
  type JobProcess,
  WorkerOptions,
} from "@livekit/agents";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as openai from "@livekit/agents-plugin-openai";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import * as silero from "@livekit/agents-plugin-silero";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from parent Next.js application
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const agentsSecret = process.env.AGENTS_INTERNAL_SECRET || "";

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    console.log("[voice-agent] Pre-warming Silero VAD model...");
    proc.userData.vad = await silero.VAD.load();
    console.log("[voice-agent] Silero VAD loaded.");
  },

  entry: async (ctx: JobContext) => {
    console.log("[voice-agent] Entry callback triggered. Connecting to room...");
    await ctx.connect();
    console.log("[voice-agent] Connected to LiveKit room. Waiting for participant...");

    const participant = await ctx.waitForParticipant();
    const userId = participant.identity;
    const userName = participant.name || "User";
    console.log(`[voice-agent] Participant joined. ID: ${userId}, Name: ${userName}`);

    const vad = ctx.proc.userData.vad! as silero.VAD;

    // Define memory-graph tools that interface with Next.js internal endpoints using llm.tool helper
    const tools = {
      search_memories: llm.tool({
        description: "Search user's past journals, notes, tasks, and memory. Use this to retrieve context and answer questions about the user's past.",
        parameters: z.object({
          query: z.string().describe("The search query to look up in the memory graph"),
        }),
        execute: async ({ query }: { query: string }) => {
          console.log(`[tool:search_memories] query: "${query}" for user: ${userId}`);
          try {
            const res = await fetch(`${appUrl}/api/search?q=${encodeURIComponent(query)}`, {
              headers: {
                "x-agents-secret": agentsSecret,
                "x-user-id": userId,
              },
            });
            if (!res.ok) {
              console.error("[tool:search_memories] HTTP error:", res.status);
              return "Failed to search memories.";
            }
            const data = await res.json();
            return JSON.stringify(data);
          } catch (err: any) {
            console.error("[tool:search_memories] Fetch error:", err);
            return `Error searching memories: ${err.message}`;
          }
        },
      }),

      create_journal_entry: llm.tool({
        description: "Create a new journal entry or personal note in the user's memory.",
        parameters: z.object({
          title: z.string().describe("Title of the journal entry"),
          content: z.string().describe("Detailed content body of the journal"),
        }),
        execute: async ({ title, content }: { title: string; content: string }) => {
          console.log(`[tool:create_journal] title: "${title}" for user: ${userId}`);
          try {
            const res = await fetch(`${appUrl}/api/sources`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-agents-secret": agentsSecret,
                "x-user-id": userId,
              },
              body: JSON.stringify({ type: "journal", title, content, origin: "livekit" }),
            });
            if (!res.ok) {
              console.error("[tool:create_journal] HTTP error:", res.status);
              return "Failed to create journal entry.";
            }
            return "Journal entry created successfully.";
          } catch (err: any) {
            console.error("[tool:create_journal] Fetch error:", err);
            return `Error creating journal entry: ${err.message}`;
          }
        },
      }),

      create_task: llm.tool({
        description: "Add a new task or to-do item for the user.",
        parameters: z.object({
          title: z.string().describe("Title of the task"),
          description: z.string().optional().describe("Optional description details of the task"),
        }),
        execute: async ({ title, description }: { title: string; description?: string }) => {
          console.log(`[tool:create_task] title: "${title}" for user: ${userId}`);
          try {
            const res = await fetch(`${appUrl}/api/tasks`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-agents-secret": agentsSecret,
                "x-user-id": userId,
              },
              body: JSON.stringify({ title, description, status: "inbox" }),
            });
            if (!res.ok) {
              console.error("[tool:create_task] HTTP error:", res.status);
              return "Failed to create task.";
            }
            return "Task created successfully.";
          } catch (err: any) {
            console.error("[tool:create_task] Fetch error:", err);
            return `Error creating task: ${err.message}`;
          }
        },
      }),

      list_tasks: llm.tool({
        description: "Retrieve a list of the user's active tasks.",
        parameters: z.object({}),
        execute: async () => {
          console.log(`[tool:list_tasks] requested for user: ${userId}`);
          try {
            const res = await fetch(`${appUrl}/api/tasks?status=inbox`, {
              headers: {
                "x-agents-secret": agentsSecret,
                "x-user-id": userId,
              },
            });
            if (!res.ok) {
              console.error("[tool:list_tasks] HTTP error:", res.status);
              return "Failed to retrieve tasks.";
            }
            const data = await res.json();
            return JSON.stringify(data);
          } catch (err: any) {
            console.error("[tool:list_tasks] Fetch error:", err);
            return `Error retrieving tasks: ${err.message}`;
          }
        },
      }),
    };

    // Configure LLM model using NVIDIA NIM or OpenAI settings
    const llmModel = process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct";
    const llmBaseUrl = process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
    const llmApiKey = process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY || "";

    const llmInstance = new openai.LLM({
      model: llmModel,
      baseURL: llmBaseUrl,
      apiKey: llmApiKey,
    });

    // Configure TTS
    let ttsInstance;
    if (process.env.CARTESIA_API_KEY) {
      console.log("[voice-agent] Configuring Cartesia TTS...");
      ttsInstance = new cartesia.TTS({
        voice: "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc", // Jarvis-like voice
      });
    } else {
      console.log("[voice-agent] Cartesia API key missing. Falling back to OpenAI TTS...");
      ttsInstance = new openai.TTS({
        model: "tts-1",
        voice: "alloy",
      });
    }

    const initialContext = new llm.ChatContext();
    initialContext.addMessage({
      role: 'system',
      content: `You are Debo, the private AI memory OS companion.
Your motto: "Capture anything. Ask your past. Trust every answer."
Answer user questions in a brief, friendly, conversational tone (1-2 sentences).
You can search the user's past memories, create tasks, and write journal entries using your tools.
If the user asks about their past or queries information, always call your search_memories tool first.`,
    });

    // Initialize voice.Agent
    const agent = new voice.Agent({
      instructions: `You are Debo, the private AI memory OS companion.`,
      chatCtx: initialContext,
      tools,
      allowInterruptions: true,
    });

    // Initialize voice.AgentSession
    const session = new voice.AgentSession({
      stt: new deepgram.STT(),
      llm: llmInstance,
      tts: ttsInstance,
      vad,
    });

    console.log("[voice-agent] Starting voice session in room...");
    await session.start({ agent, room: ctx.room });

    // Initial greeting
    console.log(`[voice-agent] Greeting participant: "Hello ${userName}!"`);
    session.say(`Hello ${userName}! I am Debo. How can I help you today?`);
  },
});

// Run agent process
cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
