'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  LiveKitRoom, 
  BarVisualizer,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
} from '@livekit/components-react';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStackApp } from '@stackframe/stack';

// --- Components ---

/**
 * Pulse indicator for thinking/processing state
 */
const AgentChatIndicator = ({ state }: { state: string }) => {
  if (state !== 'thinking' && state !== 'speaking') return null;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl animate-in fade-in zoom-in duration-300">
      <span className="relative flex h-3 w-3">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          state === 'speaking' ? "bg-duo-macaw" : "bg-duo-canary"
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-3 w-3",
          state === 'speaking' ? "bg-duo-macaw" : "bg-duo-canary"
        )}></span>
      </span>
      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
        {state === 'speaking' ? 'Debo Speaking' : 'Debo Thinking'}
      </span>
    </div>
  );
};

const MascotDisplay = ({ state }: { state: string }) => {
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isListening = state === 'listening';

  return (
    <div className="relative group perspective-1000">
      {/* Dynamic Glow Background */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-[80px] opacity-40 transition-all duration-1000 scale-125",
        isSpeaking ? "bg-duo-macaw animate-pulse" : 
        isThinking ? "bg-duo-canary animate-bounce" : 
        isListening ? "bg-duo-feather" : "bg-duo-wolf"
      )} />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Mascot Container */}
        <div className={cn(
          "w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] bg-white flex items-center justify-center overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.2)]",
          isSpeaking ? "border-duo-macaw scale-105 shadow-[0_0_40px_var(--duo-macaw)]" : 
          isThinking ? "border-duo-canary rotate-6 shadow-[0_0_30px_var(--duo-canary)]" : 
          "border-duo-feather"
        )}>
          {/* Mascot Image Placeholder */}
          <div className="text-9xl transform transition-transform duration-300 hover:scale-110 select-none">
            {isSpeaking ? '🦉' : isThinking ? '🤔' : isListening ? '👂' : '😴'}
          </div>
        </div>

        {/* State Label */}
        <div className="mt-8">
           <AgentChatIndicator state={state} />
        </div>
      </div>
    </div>
  );
};

const VoiceContent = () => {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  const toggleMute = () => {
    localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-12 px-6 max-w-4xl mx-auto w-full">
      {/* Header Info */}
      <div className="text-center space-y-2 animate-in slide-in-from-top duration-700">
        <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">
          Talk to <span className="text-duo-canary">Debo</span>
        </h1>
        <p className="text-white/60 font-medium text-lg">
          {state === 'idle' ? 'Ready when you are' : 
           state === 'listening' ? 'I\'m listening...' : 
           state === 'speaking' ? 'Sharing thoughts' : 'Thinking...'}
        </p>
      </div>

      {/* Centerpiece: Mascot & Visualizer */}
      <div className="flex flex-col items-center justify-center flex-1 w-full space-y-12">
        <MascotDisplay state={state} />
        
        {/* Enhanced Visualizer Container */}
        <div className="w-full max-w-md h-24 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full blur-md" />
          <BarVisualizer 
            trackRef={audioTrack} 
            barCount={40}
            className="h-full w-full"
            style={{ 
              color: 'var(--duo-macaw)',
              filter: 'drop-shadow(0 0 8px var(--duo-macaw))'
            }} 
          />
        </div>

        {/* Transcript Overlay */}
        {lastTranscript && (
          <div className="max-w-xl text-center animate-in fade-in slide-in-from-bottom duration-500">
            <p className="text-xl md:text-2xl font-bold text-white/90 leading-tight italic">
              &ldquo;{lastTranscript}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-6 animate-in slide-in-from-bottom duration-700 delay-300">
        <button 
          onClick={toggleMute}
          className={cn(
            "p-6 rounded-3xl transition-all duration-300 shadow-[0_8px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-2 group",
            isMuted ? "bg-duo-cardinal hover:bg-red-500" : "bg-white/10 hover:bg-white/20 border border-white/20"
          )}
        >
          {isMuted ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="p-6 bg-duo-cardinal rounded-3xl hover:bg-red-500 transition-all duration-300 shadow-[0_8px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-2 group"
        >
          <PhoneOff className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        </button>

        <button 
          className="p-6 bg-white/10 rounded-3xl hover:bg-white/20 border border-white/20 transition-all duration-300 shadow-[0_8px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-2 group"
        >
          <Sparkles className="w-8 h-8 text-duo-canary group-hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const TalkPageContent = ({ token }: { token: string }) => {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
      className="fixed inset-0 bg-[#131f24] overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(31,213,249,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_80%)] opacity-10" />
      
      <VoiceContent />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

export default function TalkPage() {
  const [token, setToken] = useState<string | null>(null);
  const stack = useStackApp();
  const user = stack.useUser();

  useEffect(() => {
    const fetchToken = async () => {
      if (!user) return;
      try {
        const room = `room-${user.id}`;
        const identity = user.id;
        const resp = await fetch(
          `/api/livekit/token?room=${room}&identity=${identity}`
        );
        const data = await resp.json() as { token: string };
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    };

    fetchToken();
  }, [user]);

  if (!token) {
    return (
      <div className="fixed inset-0 bg-[#131f24] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/10 border-t-duo-macaw rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-duo-macaw animate-pulse" />
          </div>
        </div>
        <p className="text-white/60 font-medium animate-pulse">Initializing encrypted voice link...</p>
      </div>
    );
  }

  return <TalkPageContent token={token} />;
}