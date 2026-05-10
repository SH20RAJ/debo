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
    await ctx.connect();
    console.log('Connected to room', ctx.room.name);

    const participant = await ctx.waitForParticipant();
    const userId = participant.identity; 

    // Create function context for tools
    const runtimeTools = createDeboRuntimeTools(userId);
    const tools: llm.ToolContext = {};

    for (const [name, t] of Object.entries(runtimeTools)) {
        tools[name] = llm.tool({
            description: t.description,
            parameters: zodToJsonSchema(t.inputSchema as any) as any,
            execute: async (args) => {
                console.log(`Executing tool ${name} with args:`, args);
                return await t.execute(args as any);
            }
        });
    }

    const agent = new voice.Agent({
      stt: new deepgram.STT(),
      llm: new openai.LLM({
        model: 'gpt-4o',
      }),
      tts: new cartesia.TTS({
        voice: '79a125e8-cd45-4c13-8a25-30e737485291',
      }),
      instructions: DEBO_SYSTEM_PROMPT,
      tools: tools,
    });

    const session = new voice.AgentSession();
    await session.start({ agent, room: ctx.room });
    
    session.say('Hello! I am Debo, your personal intelligence. How can I help you today?');
  },
});

cli.runApp(new WorkerOptions({ agent: 'debo-voice' }));
