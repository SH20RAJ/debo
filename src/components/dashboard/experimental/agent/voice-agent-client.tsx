"use client";

import { useEffect, useState } from "react";
import {
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Loader2, Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LiveKitRoomDynamic = dynamic(
    () => import("@livekit/components-react").then((mod) => mod.LiveKitRoom),
    { ssr: false }
);

export function VoiceAgentClient() {
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/livekit/token");
      const data = await res.json() as { token?: string };
      if (data.token) {
        setToken(data.token);
      } else {
        toast.error("Link failed. Check server.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error connecting.");
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => {
    setToken(null);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {!token ? (
        <div className="text-center space-y-12 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse shadow-inner">
                <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mx-auto animate-bounce" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Intelligence Link Ready</p>
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={startSession} 
            disabled={isConnecting}
            className="w-full h-20 text-xl rounded-3xl shadow-2xl hover:shadow-primary/20 transition-all duration-500 bg-primary hover:scale-[1.02] active:scale-[0.98]"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="mr-3 h-6 w-6" />
                Talk to Intelligence
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
            <span>Cloud Link</span>
            <span>Encrypted</span>
            <span>Real-time</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center">
          <LiveKitRoomDynamic
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://daksha-fuq54ytc.livekit.cloud"}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={endSession}
            onError={(e) => {
                console.error("LiveKit Error:", e);
                toast.error("Link broken. Try again.");
                setToken(null);
            }}
            className="w-full flex-1 flex flex-col"
          >
            <AgentInterface onEnd={endSession} />
            <RoomAudioRenderer />
          </LiveKitRoomDynamic>
        </div>
      )}
    </div>
  );
}

function AgentInterface({ onEnd }: { onEnd: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (localParticipant) {
        setIsMuted(!localParticipant.isMicrophoneEnabled);
    }
  }, [localParticipant?.isMicrophoneEnabled]);

  const toggleMute = async () => {
    const nextMute = !isMuted;
    await localParticipant.setMicrophoneEnabled(!nextMute);
    setIsMuted(nextMute);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between py-12">
      <div className="w-full flex justify-between items-center px-4 max-w-2xl">
        <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${state === 'speaking' ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground/60">Live Intelligence</span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
            Synced
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 w-full">
        <div className="relative">
            <div className={`absolute inset-0 bg-primary/20 rounded-full blur-3xl transition-all duration-1000 ${state === 'speaking' ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`} />
            <div className={`w-48 h-48 rounded-full border-2 border-primary/20 flex items-center justify-center bg-background relative z-10 transition-all duration-500 ${state === 'speaking' ? 'scale-110 shadow-2xl shadow-primary/20' : 'scale-100 shadow-none'}`}>
                {state === 'speaking' ? (
                     <div className="w-32 h-32 flex items-center justify-center">
                        <BarVisualizer trackRef={audioTrack} barCount={7} className="h-12 w-full" />
                     </div>
                ) : (
                    <Bot className="h-20 w-20 text-primary/40" />
                )}
            </div>
            
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
                    {state === 'speaking' ? 'Speaking' : state === 'listening' ? 'Listening' : 'Thinking'}
                </span>
            </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex items-center gap-6">
            <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="h-20 w-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={toggleMute}
            >
                {isMuted ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="h-20 w-20 rounded-full shadow-xl border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={onEnd}
            >
                <PhoneOff className="h-8 w-8" />
            </Button>
        </div>

        <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-widest">Secure Link: {localParticipant?.sid?.substring(0, 8) || '...'}</p>
        </div>
      </div>
    </div>
  );
}
