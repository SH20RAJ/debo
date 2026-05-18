import { WorkerOptions, cli, defineAgent, inference, voice } from '@livekit/agents';
import * as silero from '@livekit/agents-plugin-silero';
import { fileURLToPath } from 'node:url';

export default defineAgent({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx) => {
    const agent = new voice.Agent({
      instructions: `You are JARVIS, an intelligent AI voice assistant.
Be concise, helpful, and slightly witty. Respond in a natural conversational tone.
Keep responses brief unless the user asks for detail.`,
    });

    const session = new voice.AgentSession({
      vad: ctx.proc.userData.vad,
      stt: new inference.STT({ model: 'deepgram/nova-3', language: 'en' }),
      llm: new inference.LLM({ model: 'openai/gpt-4.1-mini' }),
      tts: new inference.TTS({ model: 'cartesia/sonic-3', voice: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc' }),
    });

    await session.start({ agent, room: ctx.room });

    const participant = await ctx.waitForParticipant();
    console.log(`${participant.identity} connected`);

    session.say('Hello, I am JARVIS. How can I assist you today?');
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
