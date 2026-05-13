"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  BarVisualizer,
  RoomAudioRenderer,
  StartAudio,
  useLocalParticipant,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Bot, Loader2, Mic, MicOff, PhoneOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LiveKitRoom = dynamic(
  () => import("@livekit/components-react").then((mod) => mod.LiveKitRoom),
  { ssr: false },
);

type LiveKitTokenResponse = {
  token?: string;
  serverUrl?: string;
  roomName?: string;
  participantName?: string;
  error?: string;
};

export function VoiceAgentClient() {
  const [session, setSession] = useState<{
    token: string;
    serverUrl: string;
    roomName: string;
    participantName: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/livekit/token?room=debo-talk-${Date.now()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as LiveKitTokenResponse;

      if (!response.ok || !data.token || !data.serverUrl) {
        throw new Error(data.error || "LiveKit is not ready.");
      }

      setSession({
        token: data.token,
        serverUrl: data.serverUrl,
        roomName: data.roomName || "debo-talk",
        participantName: data.participantName || "You",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start voice chat.");
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => setSession(null);

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl border border-border/70 bg-background shadow-sm">
            <img src="/debo.png" alt="Debo" className="size-12 object-contain" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Live voice
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Talk to Debo
            </h1>
            <p className="mx-auto max-w-md text-base leading-7 text-muted-foreground">
              Start a voice session with memory context. Debo can listen, answer, and remember only when you ask.
            </p>
          </div>

          <Button
            size="lg"
            onClick={startSession}
            disabled={isConnecting}
            className="h-14 rounded-2xl px-8 text-base font-semibold"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Connecting
              </>
            ) : (
              <>
                <Mic className="mr-2 size-5" />
                Start Talking
              </>
            )}
          </Button>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 px-3 py-1.5">LiveKit room</span>
            <span className="rounded-full border border-border/70 px-3 py-1.5">Dashboard memories</span>
            <span className="rounded-full border border-border/70 px-3 py-1.5">Low-latency voice</span>
          </div>
        </div>
      </div>
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
        console.error("[Talk] LiveKit error:", error);
        toast.error("Voice session ended. Please start again.");
        endSession();
      }}
      className="flex min-h-[calc(100vh-5rem)] flex-1 flex-col bg-background"
    >
      <VoiceRoom
        roomName={session.roomName}
        participantName={session.participantName}
        onEnd={endSession}
      />
      <RoomAudioRenderer />
      <StartAudio
        label="Enable audio"
        className="fixed bottom-6 left-1/2 z-50 h-11 -translate-x-1/2 rounded-full border border-border bg-background px-5 text-sm font-medium shadow-lg"
      />
    </LiveKitRoom>
  );
}

function VoiceRoom({
  roomName,
  participantName,
  onEnd,
}: {
  roomName: string;
  participantName: string;
  onEnd: () => void;
}) {
  const { state, audioTrack, agentTranscriptions, agent } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(!localParticipant.isMicrophoneEnabled);
  }, [localParticipant.isMicrophoneEnabled]);

  const latestAgentText = useMemo(() => {
    return agentTranscriptions
      .map((segment) => segment.text)
      .filter(Boolean)
      .slice(-2)
      .join(" ");
  }, [agentTranscriptions]);

  const toggleMute = async () => {
    const nextMuted = !isMuted;
    await localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
  };

  const statusLabel = agent
    ? state === "speaking"
      ? "Debo is speaking"
      : state === "listening"
        ? "Debo is listening"
        : "Debo is thinking"
    : "Waiting for Debo";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 md:px-8 md:py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{statusLabel}</p>
          <p className="truncate text-xs text-muted-foreground">
            {participantName} in {roomName}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="size-3.5 text-primary" />
          Context on
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 py-10 text-center">
        <div className="relative flex size-56 items-center justify-center rounded-[2rem] border border-border/70 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
          <div
            className={cn(
              "absolute inset-8 rounded-full bg-primary/10 blur-3xl transition-all duration-700",
              state === "speaking" ? "scale-125 opacity-100" : "scale-95 opacity-40",
            )}
          />
          {state === "speaking" && audioTrack ? (
            <BarVisualizer
              state={state}
              trackRef={audioTrack}
              barCount={9}
              className="relative z-10 h-20 w-36 text-primary"
            />
          ) : (
            <Bot className="relative z-10 size-20 text-muted-foreground/50" />
          )}
        </div>

        <div className="min-h-24 w-full max-w-2xl rounded-2xl border border-border/70 bg-muted/20 px-6 py-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Debo
          </p>
          <p className="mt-3 text-lg leading-8 text-foreground">
            {latestAgentText || "Say something when you are ready."}
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-3 pb-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className={cn(
            "size-14 rounded-2xl",
            isMuted && "border-destructive/40 bg-destructive/10 text-destructive",
          )}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onEnd}
          className="size-14 rounded-2xl"
          aria-label="End voice session"
        >
          <PhoneOff className="size-5" />
        </Button>
      </footer>
    </div>
  );
}
