'use client';

import React, { useEffect, useState } from 'react';
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
  X, 
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStackApp } from '@stackframe/stack';

const VoiceContent = () => {
  const { state, audioTrack, agentTranscripts } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isListening = state === "listening";

  const toggleMute = () => {
    localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-duo-polar rounded-[3rem] border-4 border-duo-swan shadow-[0_12px_0_var(--duo-swan-shadow)] overflow-hidden">
      
      {/* Background Aura - Subtle and clean */}
      <div className={cn(
        "absolute inset-0 z-0 transition-opacity duration-1000",
        isSpeaking ? "opacity-30" : "opacity-10"
      )}>
        <div className={cn(
          "absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700",
          isSpeaking ? "bg-duo-macaw scale-110" : 
          isThinking ? "bg-duo-canary scale-105" : 
          isListening ? "bg-duo-feather scale-100" : "bg-duo-wolf scale-95"
        )} />
      </div>

      {/* Header - Minimal */}
      <div className="absolute top-12 left-12 z-10 flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw">
          <Zap className="h-6 w-6 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-lg font-black text-duo-eel">DEBO</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-duo-wolf">Voice Session</span>
        </div>
      </div>

      {/* Center - Mascot & Focus */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl w-full px-8">
        
        {/* The Mascot */}
        <div className={cn(
          "relative flex size-44 items-center justify-center rounded-[2.5rem] border-4 bg-white transition-all duration-500",
          isSpeaking ? "border-duo-macaw scale-110 shadow-[0_8px_0_var(--duo-macaw-shadow)]" : 
          isThinking ? "border-duo-canary animate-bounce shadow-[0_8px_0_var(--duo-canary-shadow)]" : 
          isListening ? "border-duo-feather shadow-[0_8px_0_var(--duo-feather-shadow)]" :
          "border-duo-swan shadow-[0_8px_0_var(--duo-swan-shadow)]"
        )}>
          <div className="text-7xl">
            {isSpeaking ? "🦜" : isThinking ? "🧠" : isListening ? "👂" : "🤖"}
          </div>
          
          {/* Status Dot */}
          <div className={cn(
            "absolute -bottom-2 -right-2 size-6 rounded-full border-4 border-white shadow-sm",
            isSpeaking ? "bg-duo-macaw" : isThinking ? "bg-duo-canary" : isListening ? "bg-duo-feather" : "bg-duo-swan"
          )} />
        </div>

        {/* Transcript Area - Clean and Centered */}
        <div className="text-center space-y-4">
          <div className="min-h-[4rem] flex items-center justify-center">
            <p className="text-2xl font-black text-duo-eel leading-tight transition-all duration-500">
              {isSpeaking ? (
                agentTranscripts[agentTranscripts.length - 1]?.text
              ) : isThinking ? (
                <span className="text-duo-canary italic opacity-80">Synthesizing...</span>
              ) : isListening ? (
                <span className="text-duo-feather opacity-80">I'm listening...</span>
              ) : (
                <span className="text-duo-wolf opacity-40 italic">Waiting to chat...</span>
              )}
            </p>
          </div>

          {/* Subtle Visualizer */}
          <div className="h-16 w-64 mx-auto flex items-center justify-center">
            <BarVisualizer 
              trackRef={audioTrack} 
              barCount={30}
              className="w-full h-full gap-1"
              options={{ minHeight: 2, maxHeight: 60 }}
            />
          </div>
        </div>
      </div>

      {/* Footer - Minimal Controls */}
      <div className="absolute bottom-12 inset-x-0 z-10 flex items-center justify-center gap-6">
        <button 
          onClick={toggleMute}
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl border-4 transition-all active:translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none",
            isMuted 
              ? "border-duo-cardinal bg-duo-cardinal/10 text-duo-cardinal" 
              : "border-duo-macaw bg-duo-macaw/10 text-duo-macaw"
          )}
        >
          {isMuted ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </button>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="flex h-16 items-center gap-3 rounded-2xl border-4 border-duo-cardinal bg-duo-cardinal text-white px-10 font-heading text-lg font-black tracking-wider shadow-[0_4px_0_var(--duo-cardinal-shadow)] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none"
        >
          <X className="h-6 w-6" />
          END
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
      className="fixed inset-0 bg-[#131f24] p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(31,213,249,0.1),transparent_60%)]" />
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
        console.error("[TalkPage] Token fetch error:", e);
      }
    };

    fetchToken();
  }, [user]);

  if (!token) {
    return (
      <div className="fixed inset-0 bg-[#131f24] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="size-24 border-4 border-white/10 border-t-duo-macaw rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 text-duo-macaw animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white/80 font-black text-xl tracking-tight">Syncing Neural Link...</p>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Connecting to Debo Cluster</p>
        </div>
      </div>
    );
  }

  return <TalkPageContent token={token} />;
}