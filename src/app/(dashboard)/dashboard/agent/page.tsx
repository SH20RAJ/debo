"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
  useLocalParticipant,
  VoiceAssistantControlBar,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Loader2, Sparkles, User, Bot } from "lucide-react";
import { toast } from "sonner";

export default function AgentPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/livekit/token");
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      } else {
        toast.error("Failed to get connection token.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while connecting.");
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => {
    setToken(null);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:px-10 md:py-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {!token ? (
        <div className="text-center space-y-12 max-w-md w-full">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse shadow-inner">
                <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mx-auto animate-bounce" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Neural Link Ready</p>
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
                Initializing...
              </>
            ) : (
              <>
                <Mic className="mr-3 h-6 w-6" />
                Establish Voice Link
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
            <span>Cloud SSE</span>
            <span>AES-256</span>
            <span>Mem0 Sync</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center">
          <LiveKitRoom
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://daksha-fuq54ytc.livekit.cloud"}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={endSession}
            className="w-full flex-1 flex flex-col"
          >
            <AgentInterface onEnd={endSession} />
          </LiveKitRoom>
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
    setIsMuted(!localParticipant.isMicrophoneEnabled);
  }, [localParticipant.isMicrophoneEnabled]);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between py-12">
      {/* Top Status */}
      <div className="w-full flex justify-between items-center px-4 max-w-2xl">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-tight">Active Session</span>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            Latency: 45ms
        </div>
      </div>

      {/* Visualizer and Avatar Section */}
      <div className="flex flex-col items-center gap-12 w-full">
        <div className="relative group">
            <div className={`absolute inset-0 bg-primary/20 rounded-full blur-3xl transition-opacity duration-1000 ${state === 'speaking' ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`w-48 h-48 rounded-full border-2 border-primary/20 flex items-center justify-center bg-background relative z-10 transition-transform duration-500 ${state === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                {state === 'speaking' ? (
                     <div className="w-32 h-32 flex items-center justify-center">
                        <BarVisualizer trackRef={audioTrack} barCount={7} className="h-12 w-full" />
                     </div>
                ) : (
                    <Bot className="h-20 w-20 text-primary/40" />
                )}
            </div>
            
            {/* Status Label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    {state === 'speaking' ? 'Agent is speaking' : state === 'listening' ? 'Listening to you' : 'Agent is thinking'}
                </span>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex items-center gap-6">
            <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg transition-all duration-300"
                onClick={() => localParticipant.setMicrophoneEnabled(isMuted)}
            >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                onClick={onEnd}
            >
                <PhoneOff className="h-6 w-6" />
            </Button>
        </div>

        <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground font-medium">Session ID: {localParticipant.sid.substring(0, 8)}</p>
            <RoomAudioRenderer />
        </div>
      </div>
    </div>
  );
}
