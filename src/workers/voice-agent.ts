import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
} from '@livekit/agents';
import { VoicePipelineAgent } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import { DEBO_SYSTEM_PROMPT } from '../lib/chat/debo-tools';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('Connected to room', ctx.room.name);

    const participant = await ctx.waitForParticipant();
    
    // The voice agent joins and talks to the user.
    const agent = new VoicePipelineAgent({
      stt: new deepgram.STT(),
      llm: new openai.LLM({
        model: 'gpt-4o',
        instructions: DEBO_SYSTEM_PROMPT,
      }),
      tts: new cartesia.TTS({
        voice: '79a125e8-cd45-4c13-8a25-30e737485291',
      }),
    });

    await agent.start(ctx.room, participant);
    
    // Greet the user
    await agent.say('Hello! I am Debo, your personal intelligence. How can I help you today?');
  },
});

// To run this:
// export LIVEKIT_URL=...
// export LIVEKIT_API_KEY=...
// export LIVEKIT_API_SECRET=...
// export DEEPGRAM_API_KEY=...
// export OPENAI_API_KEY=...
// export CARTESIA_API_KEY=...
// bun run src/workers/voice-agent.ts dev
