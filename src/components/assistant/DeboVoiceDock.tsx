"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useVoiceAssistant,
} from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { toast } from "sonner";

type VoiceSession = {
  token: string;
  serverUrl: string;
  roomName: string;
};

type VoiceTokenResponse = Partial<VoiceSession> & {
  error?: string;
};

export function DeboVoiceDock() {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/livekit/token", { cache: "no-store" });
      const data = (await res.json()) as VoiceTokenResponse;

      if (!res.ok || !data.token || !data.serverUrl || !data.roomName) {
        throw new Error(data.error || "LiveKit connection failed");
      }

      setSession({
        token: data.token,
        serverUrl: data.serverUrl,
        roomName: data.roomName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Voice link failed";
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
  }, []);

  if (!session) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Start voice link"
            onClick={startSession}
            disabled={isConnecting}
            className="h-9 w-9 rounded-md border border-white/10 bg-white/[0.04] text-white/70 hover:border-emerald-300/40 hover:bg-white/[0.07] hover:text-emerald-200"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Start voice link</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={session.serverUrl}
      token={session.token}
      connect
      audio
      video={false}
      onDisconnected={endSession}
      onError={(error) => {
        toast.error(error.message || "Voice link dropped");
        endSession();
      }}
      className="contents"
    >
      <VoiceControls onEnd={endSession} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function VoiceControls({ onEnd }: { onEnd: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(!localParticipant.isMicrophoneEnabled);
  }, [localParticipant.isMicrophoneEnabled]);

  const toggleMute = async () => {
    const nextMuted = !isMuted;
    await localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
  };

  const stateLabel =
    state === "speaking" ? "Speaking" : state === "listening" ? "Listening" : "Linked";

  return (
    <div className="flex items-center gap-2">
      <div className="hidden h-9 items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200 sm:flex">
        <Radio className={cn("h-3.5 w-3.5", state === "speaking" && "animate-pulse")} />
        <span className="w-[5.5rem]">{stateLabel}</span>
        {audioTrack ? (
          <BarVisualizer
            state={state}
            track={audioTrack}
            barCount={5}
            className="h-4 w-12"
          />
        ) : null}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            onClick={toggleMute}
            className={cn(
              "h-9 w-9 rounded-md border border-white/10 bg-white/[0.04] text-white/70 hover:border-emerald-300/40 hover:bg-white/[0.07] hover:text-emerald-200",
              isMuted && "border-amber-300/35 bg-amber-300/10 text-amber-200"
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isMuted ? "Unmute microphone" : "Mute microphone"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="End voice link"
            onClick={onEnd}
            className="h-9 w-9 rounded-md border border-rose-300/25 bg-rose-300/10 text-rose-200 hover:border-rose-300/45 hover:bg-rose-300/15"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>End voice link</TooltipContent>
      </Tooltip>
    </div>
  );
}
