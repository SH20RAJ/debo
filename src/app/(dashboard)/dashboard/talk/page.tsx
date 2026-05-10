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
  Settings, 
  X, 
  Maximize2, 
  Shield, 
  Activity, 
  Wifi,
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStackApp } from '@stackframe/stack';

// --- Tactical UI Components ---

function TacticalButton({ icon: Icon, label, color = "macaw", active = false }: { icon: any, label: string, color?: string, active?: boolean }) {
  const colorMap = {
    macaw: "text-duo-macaw border-duo-macaw bg-duo-macaw/10 shadow-[0_4px_0_var(--duo-macaw-shadow)]",
    wolf: "text-duo-wolf border-duo-swan bg-white shadow-[0_4px_0_var(--duo-swan-shadow)] hover:bg-duo-swan/10",
    cardinal: "text-duo-cardinal border-duo-cardinal bg-duo-cardinal/10 shadow-[0_4px_0_var(--duo-cardinal-shadow)]",
  };

  return (
    <button className={cn(
      "flex h-12 items-center gap-3 rounded-xl border-2 px-4 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none",
      active ? colorMap[color as keyof typeof colorMap] : "text-duo-wolf border-duo-swan bg-white hover:bg-duo-swan/10"
    )}>
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function AgentChatIndicator({ state }: { state: string }) {
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isListening = state === "listening";

  return (
    <div className="flex items-center gap-3 rounded-full bg-white px-6 py-2 border-2 border-duo-swan shadow-[0_4px_0_var(--duo-swan-shadow)]">
      <div className="relative flex size-3 items-center justify-center">
        <div className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-75",
          isSpeaking ? "bg-duo-macaw" : isThinking ? "bg-duo-canary" : isListening ? "bg-duo-feather" : "bg-duo-swan"
        )} />
        <div className={cn(
          "relative size-3 rounded-full",
          isSpeaking ? "bg-duo-macaw" : isThinking ? "bg-duo-canary" : isListening ? "bg-duo-feather" : "bg-duo-swan"
        )} />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.2em] text-duo-eel">
        {isSpeaking ? "DEBO IS SPEAKING" : isThinking ? "THINKING..." : isListening ? "LISTENING" : "STANDBY"}
      </span>
    </div>
  );
}

const VoiceContent = () => {
  const { state, audioTrack, agentTranscripts } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [showTactical, setShowTactical] = useState(true);

  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isListening = state === "listening";

  const toggleMute = () => {
    localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-duo-swan bg-duo-polar shadow-[0_12px_0_var(--duo-swan-shadow)] transition-all duration-500">
      
      {/* Dynamic Background Aura */}
      <div className={cn(
        "absolute inset-0 z-0 opacity-20 transition-opacity duration-1000",
        isSpeaking ? "opacity-40" : "opacity-10"
      )}>
        <div className={cn(
          "absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-all duration-700",
          isSpeaking ? "bg-duo-macaw scale-110" : 
          isThinking ? "bg-duo-canary scale-105" : 
          isListening ? "bg-duo-feather scale-100" : "bg-duo-wolf scale-95"
        )} />
      </div>

      {/* Tactical Grid Overlay */}
      {showTactical && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      )}

      {/* Header Info */}
      <div className="absolute left-10 top-10 z-10 flex items-center gap-6">
        <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)]">
          <Zap className="h-8 w-8 fill-current" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-black text-duo-eel">DEBO TALK</h1>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", isListening ? "bg-duo-feather" : "bg-duo-swan")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-duo-wolf">Neural Link Active</span>
          </div>
        </div>
      </div>

      {/* Connection Stats */}
      <div className="absolute right-10 top-10 z-10 flex gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/50 px-4 py-2 border-2 border-duo-swan backdrop-blur-md">
          <Wifi className="h-4 w-4 text-duo-macaw" />
          <span className="text-[10px] font-black text-duo-eel uppercase tracking-tighter">94 ms</span>
        </div>
        <button 
          onClick={() => setShowTactical(!showTactical)}
          className="flex size-10 items-center justify-center rounded-xl border-2 border-duo-swan bg-white/50 text-duo-wolf hover:bg-duo-swan/20 transition-all active:translate-y-0.5"
        >
          <Activity className="h-5 w-5" />
        </button>
      </div>

      {/* Central Interactive Zone */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        
        {/* The Mascot / Aura Core */}
        <div className="relative">
          {/* Pulsing Aura Rings */}
          <div className={cn(
            "absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-duo-macaw/20 transition-all duration-1000",
            isSpeaking ? "animate-spin-slow scale-125 opacity-100" : "scale-100 opacity-0"
          )} />
          <div className={cn(
            "absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-duo-feather/30 transition-all duration-700 delay-100",
            isSpeaking ? "animate-[spin_20s_linear_infinite_reverse] scale-110 opacity-100" : "scale-100 opacity-0"
          )} />

          {/* Core Mascot Container */}
          <div className={cn(
            "group relative flex size-40 items-center justify-center rounded-[2.5rem] border-4 border-duo-swan bg-white shadow-[0_8px_0_var(--duo-swan-shadow)] transition-all duration-500",
            isSpeaking && "scale-110 border-duo-macaw shadow-[0_8px_0_var(--duo-macaw-shadow)]",
            isThinking && "animate-bounce border-duo-canary shadow-[0_8px_0_var(--duo-canary-shadow)]",
            isListening && "border-duo-feather shadow-[0_8px_0_var(--duo-feather-shadow)]"
          )}>
            <div className="text-7xl transition-transform duration-300 group-hover:scale-110">
              {isSpeaking ? "🦜" : isThinking ? "🧠" : isListening ? "👂" : "🤖"}
            </div>

            {/* Speaking Aura Effect */}
            {isSpeaking && (
              <div className="absolute -inset-4 rounded-[3rem] border-4 border-duo-macaw/30 animate-ping pointer-events-none" />
            )}
          </div>
        </div>

        {/* The Perfect Visualizer */}
        <div className="relative h-32 w-[32rem] flex items-center justify-center">
          {/* Visualizer Background Glow */}
          <div className={cn(
            "absolute inset-x-0 h-1 blur-2xl transition-all duration-500",
            isSpeaking ? "bg-duo-macaw opacity-50" : "bg-transparent opacity-0"
          )} />
          
          <BarVisualizer 
            trackRef={audioTrack} 
            barCount={40}
            className="w-full h-full gap-1.5"
            options={{
              minHeight: 4,
              maxHeight: 120
            }}
          />
        </div>

        {/* State Indicator */}
        <div className="flex flex-col items-center gap-4">
          <AgentChatIndicator state={state} />
          
          {/* Transcript Preview */}
          <div className="max-w-md text-center">
            <p className="text-lg font-black text-duo-eel line-clamp-2 min-h-[3.5rem] animate-in fade-in slide-in-from-bottom-2 duration-500">
              {isSpeaking ? (
                agentTranscripts[agentTranscripts.length - 1]?.text || "Listening to context..."
              ) : isThinking ? (
                "Synthesizing knowledge..."
              ) : isListening ? (
                "I'm all ears..."
              ) : (
                "Waiting for neural uplink..."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tactical Controls Footer */}
      <div className="absolute inset-x-10 bottom-10 z-10 flex items-center justify-between">
        <div className="flex gap-4">
          <TacticalButton icon={Shield} label="Neural Guard" color="macaw" active />
          <TacticalButton icon={Settings} label="Protocols" color="wolf" />
        </div>

        <div className="flex items-center gap-6 rounded-[2rem] border-4 border-duo-swan bg-white p-2 shadow-[0_8px_0_var(--duo-swan-shadow)]">
          <button 
            onClick={toggleMute}
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl border-2 transition-all active:translate-y-1 shadow-none active:shadow-none",
              isMuted 
                ? "border-duo-cardinal bg-duo-cardinal/10 text-duo-cardinal shadow-[0_4px_0_var(--duo-cardinal-shadow)]" 
                : "border-duo-macaw bg-duo-macaw/10 text-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)]"
            )}
          >
            {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </button>
          <div className="h-10 w-0.5 bg-duo-swan/50" />
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex h-14 items-center gap-3 rounded-2xl border-2 border-duo-cardinal bg-duo-cardinal text-white px-8 font-heading text-lg font-black tracking-wider shadow-[0_4px_0_var(--duo-cardinal-shadow)] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none"
          >
            <X className="h-6 w-6" />
            DISCONNECT
          </button>
        </div>

        <div className="flex gap-4">
          <TacticalButton icon={Maximize2} label="Immersive" color="wolf" />
        </div>
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
      
      <div className="relative h-full w-full p-6">
         <VoiceContent />
      </div>
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
token} />;
}