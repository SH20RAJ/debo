import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
} from '@livekit/agents';
import { VoicePipelineAgent } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import { DEBO_SYSTEM_PROMPT, createDeboRuntimeTools } from '../lib/chat/debo-tools';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('Connected to room', ctx.room.name);

    const participant = await ctx.waitForParticipant();
    const userId = participant.identity; 

    // Create function context for tools
    const runtimeTools = createDeboRuntimeTools(userId);
    const fncCtx: llm.FunctionContext = {};

    for (const [name, tool] of Object.entries(runtimeTools)) {
        fncCtx[name] = {
            description: tool.description,
            parameters: tool.inputSchema,
            execute: async (args) => {
                console.log(`Executing tool ${name} with args:`, args);
                return await tool.execute(args as any);
            }
        };
    }

    const agent = new VoicePipelineAgent({
      stt: new deepgram.STT(),
      llm: new openai.LLM({
        model: 'gpt-4o',
        instructions: DEBO_SYSTEM_PROMPT,
        fncCtx,
      }),
      tts: new cartesia.TTS({
        voice: '79a125e8-cd45-4c13-8a25-30e737485291',
      }),
    });

    await agent.start(ctx.room, participant);
    
    await agent.say('Hello! I am Debo, your personal intelligence. How can I help you today?');
  },
});

cli.runApp(new WorkerOptions({ agent: 'debo-voice' }));
