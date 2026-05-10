import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  voice
} from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import { DEBO_SYSTEM_PROMPT, createDeboRuntimeTools } from '../lib/chat/debo-tools';
import { zodToJsonSchema } from 'zod-to-json-schema';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    try {
      await ctx.connect();
      console.log(`[Debo Agent] Connected to room: ${ctx.room.name}`);

      // Wait for the user to join
      const participant = await ctx.waitForParticipant();
      const userId = participant.identity; 
      console.log(`[Debo Agent] User ${userId} joined. Initializing tools...`);

      // Create function context for tools
      const runtimeTools = createDeboRuntimeTools(userId);
      const tools: llm.ToolContext = {};

      for (const [name, t] of Object.entries(runtimeTools)) {
          tools[name] = llm.tool({
              description: t.description,
              parameters: zodToJsonSchema(t.inputSchema as any) as any,
              execute: async (args) => {
                  console.log(`[Debo Agent] Executing tool ${name} with args:`, args);
                  try {
                    return await t.execute(args as any);
                  } catch (err) {
                    console.error(`[Debo Agent] Tool ${name} failed:`, err);
                    return { error: String(err) };
                  }
              }
          });
      }

      console.log(`[Debo Agent] Starting agent for user: ${userId}`);

      const stt = new deepgram.STT();
      const llm_provider = new openai.LLM({ model: 'gpt-4o' });
      const tts = new cartesia.TTS({
        voice: '79a125e8-cd45-4c13-8a25-30e737485291',
      });

      // Subclass for onEnter greeting
      class DeboAgent extends voice.Agent {
        async onEnter() {
          console.log('[Debo Agent] Agent joined, greeting user...');
          this.session.say('Hello! I am Debo, your personal intelligence. How can I help you today?');
        }
      }

      const agent = new DeboAgent({
        stt,
        llm: llm_provider,
        tts,
        instructions: DEBO_SYSTEM_PROMPT,
        tools: tools,
      });

      const session = new voice.AgentSession({
        stt,
        llm: llm_provider,
        tts,
      });
      
      // Detailed Session Event Logging
      const sessionAny = session as any;
      sessionAny.on('error', (err: any) => {
        console.error('[Debo Agent] Session error:', err);
      });

      sessionAny.on('agent_state_changed', (ev: any) => {
        console.log(`[Debo Agent] State: ${ev.oldState} -> ${ev.newState}`);
      });

      sessionAny.on('user_input_transcribed', (ev: any) => {
        if (ev.isFinal) {
          console.log(`[Debo Agent] User: ${ev.transcript}`);
        }
      });

      await session.start({ agent, room: ctx.room });
      console.log('[Debo Agent] Session active');
    } catch (error) {
      console.error('[Debo Agent] Critical error in entry:', error);
    }
  },
});

cli.runApp(new WorkerOptions({ agent: 'debo-voice' }));
