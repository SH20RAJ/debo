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
import { Mic, MicOff, Loader2, Sparkles, Bot, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LiveKitRoomDynamic = dynamic(
    () => import("@livekit/components-react").then((mod) => mod.LiveKitRoom),
    { ssr: false }
);

export function VoiceAgentClient() {
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>("");

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/livekit/token");
      const data = await res.json() as { token?: string; serverUrl?: string };
      if (data.token) {
        setToken(data.token);
        setServerUrl(data.serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "");
      } else {
        toast.error("Intelligence link failed. Check configuration.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error connecting to intelligence.");
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => {
    setToken(null);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      {!token ? (
        <div className="text-center space-y-12 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <div className="space-y-4">
            <h1 className="text-3xl font-heading font-black text-duo-eel">Talk to Debo</h1>
            <p className="text-sm font-bold text-duo-wolf">
                Real-time, zero-latency conversation with your second brain.
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={startSession} 
            disabled={isConnecting}
            variant="default"
            className="w-full h-20 text-xl rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <Mic className="mr-3 h-6 w-6" />
                Enter Room
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-6 text-[10px] font-black text-duo-swan uppercase tracking-[0.2em]">
            <span>Cloud Link</span>
            <span>Encrypted</span>
            <span>Real-time</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full max-w-4xl flex flex-col items-center">
          <LiveKitRoomDynamic
            serverUrl={serverUrl}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={endSession}
            onError={(e) => {
                console.error("LiveKit Error:", e);
                toast.error("Link broken. Re-connecting...");
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
  }, [localParticipant]);

  const toggleMute = async () => {
    const nextMute = !isMuted;
    await localParticipant.setMicrophoneEnabled(!nextMute);
    setIsMuted(nextMute);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between py-12">
      <div className="w-full flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${state === 'speaking' ? 'bg-duo-green animate-pulse' : 'bg-duo-green'}`} />
            <span className="text-xs font-black tracking-widest uppercase text-duo-wolf">Live Intelligence</span>
        </div>
        <div className="text-[10px] font-black text-duo-swan uppercase tracking-[0.2em]">
            Room Synced
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 w-full">
        <div className="relative">
            <div className={`absolute inset-0 bg-duo-green/20 rounded-full blur-3xl transition-all duration-1000 ${state === 'speaking' ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`} />
            <div className={`w-56 h-56 rounded-[3rem] border-4 border-duo-swan flex items-center justify-center bg-white relative z-10 transition-all duration-500 shadow-xl ${state === 'speaking' ? 'scale-105 border-duo-green shadow-duo-green/20' : 'scale-100'}`}>
                {state === 'speaking' ? (
                     <div className="w-32 h-32 flex items-center justify-center">
                        <BarVisualizer trackRef={audioTrack} barCount={7} className="h-12 w-full text-duo-green" />
                     </div>
                ) : (
                    <Bot className="h-24 w-24 text-duo-swan" />
                )}
            </div>
            
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-duo-wolf">
                    {state === 'speaking' ? 'Speaking' : state === 'listening' ? 'Listening' : 'Thinking'}
                </span>
            </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
            <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className={`w-16 h-16 rounded-2xl border-2 transition-all duration-300 ${isMuted ? 'bg-duo-red/10 border-duo-red text-duo-red' : 'bg-white border-duo-swan text-duo-wolf hover:border-duo-green hover:text-duo-green'}`}
            >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            <Button
                variant="destructive"
                size="icon"
                onClick={onEnd}
                className="w-16 h-16 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all duration-100"
            >
                <PhoneOff className="h-6 w-6" />
            </Button>
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">
            {isMuted ? 'Microphone Muted' : 'Debo is listening'}
        </p>
      </div>
    </div>
  );
}
