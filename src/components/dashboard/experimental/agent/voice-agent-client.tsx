"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  BarVisualizer,
  RoomAudioRenderer,
  StartAudio,
  useConnectionState,
  useLocalParticipant,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ConnectionState, type DisconnectReason } from "livekit-client";
import { Bot, Loader2, Mic, MicOff, PhoneOff } from "lucide-react";
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
  agentName?: string;
  agentDispatchStatus?: string;
  error?: string;
};

function formatDisconnectReason(reason?: DisconnectReason) {
  if (reason === undefined) return "Voice disconnected before the room was ready.";
  return `Voice disconnected: ${String(reason).replace(/_/g, " ").toLowerCase()}.`;
}

export function VoiceAgentClient() {
  const [session, setSession] = useState<{
    token: string;
    serverUrl: string;
    roomName: string;
    participantName: string;
    agentName: string;
    agentDispatchStatus: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProblem, setConnectionProblem] = useState<string | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    setConnectionProblem(null);
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
        agentName: data.agentName || "debo-voice",
        agentDispatchStatus: data.agentDispatchStatus || "requested",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start voice chat.";
      setConnectionProblem(message);
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => setSession(null);

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-7 text-center">
          <div className="flex size-20 items-center justify-center rounded-full border border-border/70 bg-muted/20 shadow-sm">
            <Bot className="size-9 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Hey, sir.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              I'm here. What are we taking on?
            </p>
          </div>

          {connectionProblem ? (
            <div className="w-full rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
              {connectionProblem}
            </div>
          ) : null}

          <Button
            size="lg"
            onClick={startSession}
            disabled={isConnecting}
            className="h-14 rounded-full px-9 text-base font-semibold"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Bringing Debo in
              </>
            ) : (
              <>
                <Mic className="mr-2 size-5" />
                Talk
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={session.serverUrl}
      token={session.token}
      connect
      audio={{
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }}
      video={false}
      connectOptions={{
        autoSubscribe: true,
        maxRetries: 3,
        websocketTimeout: 20_000,
        peerConnectionTimeout: 30_000,
      }}
      onDisconnected={(reason) => {
        const message = formatDisconnectReason(reason);
        console.warn("[Talk] LiveKit disconnected:", reason);
        setConnectionProblem(message);
        endSession();
      }}
      onError={(error) => {
        console.error("[Talk] LiveKit error:", error);
        const message = error.message || "Voice session ended. Please start again.";
        setConnectionProblem(message);
        toast.error(message);
        endSession();
      }}
      onMediaDeviceFailure={(failure, kind) => {
        const message =
          kind === "audioinput"
            ? "Microphone permission failed. Allow mic access and start again."
            : `Media device failed: ${failure || "unknown"}.`;
        setConnectionProblem(message);
        toast.error(message);
      }}
      className="flex min-h-[calc(100vh-5rem)] flex-1 flex-col bg-background"
    >
      <VoiceRoom
        roomName={session.roomName}
        participantName={session.participantName}
        agentName={session.agentName}
        agentDispatchStatus={session.agentDispatchStatus}
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
  agentName,
  agentDispatchStatus,
  onEnd,
}: {
  roomName: string;
  participantName: string;
  agentName: string;
  agentDispatchStatus: string;
  onEnd: () => void;
}) {
  const { state, audioTrack, agentTranscriptions, agent } = useVoiceAssistant();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const localAudioTrack = useMemo(() => {
    const pub = Array.from(localParticipant.trackPublications.values())
      .find((p) => p.kind === "audio" && p.track);
    if (!pub?.track) return undefined;
    return { participant: localParticipant, publication: pub, source: pub.source };
  }, [localParticipant.trackPublications, localParticipant]);
  const [isMuted, setIsMuted] = useState(false);
  const [agentWaitExpired, setAgentWaitExpired] = useState(false);

  useEffect(() => {
    setIsMuted(!localParticipant.isMicrophoneEnabled);
  }, [localParticipant.isMicrophoneEnabled]);

  useEffect(() => {
    setAgentWaitExpired(false);
    if (agent || connectionState !== ConnectionState.Connected) return;

    const timeout = window.setTimeout(() => setAgentWaitExpired(true), 12_000);
    return () => window.clearTimeout(timeout);
  }, [agent, connectionState]);

  const latestAgentText = useMemo(() => {
    return agentTranscriptions
      .map((segment) => segment.text)
      .filter(Boolean)
      .slice(-2)
      .join(" ");
  }, [agentTranscriptions]);

  const toggleMute = async () => {
    const nextMuted = !isMuted;
    try {
      await localParticipant.setMicrophoneEnabled(!nextMuted);
      setIsMuted(nextMuted);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change microphone.");
    }
  };

  const helperText = agent
    ? latestAgentText || "I'm listening."
    : agentWaitExpired
      ? `Debo voice is offline. Run bun run voice.`
      : agentDispatchStatus === "requested"
        ? "Bringing Debo in."
        : "Starting voice.";

  const isLive = connectionState === ConnectionState.Connected && Boolean(agent);

  const statusTone = isLive
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
    : agentWaitExpired
      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "border-border/70 bg-background text-muted-foreground";

  const visualState = agent
    ? state === "speaking"
      ? "speaking"
      : state === "listening"
        ? "listening"
        : "thinking"
    : "waiting";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 md:px-8 md:py-8">
      <header className="flex items-center justify-between gap-4" aria-label={`${participantName} in ${roomName}`}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Talk</p>
        </div>
        <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm", statusTone)}>
          <span className="size-2 rounded-full bg-current" />
          {connectionState}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 py-10 text-center">
        <div className="relative flex size-56 items-center justify-center rounded-[2rem] border border-border/70 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
          <div
            className={cn(
              "absolute inset-8 rounded-full blur-3xl transition-all duration-700",
              visualState === "speaking" ? "scale-125 opacity-100 bg-primary/20" : 
              visualState === "listening" ? "scale-110 opacity-70 bg-emerald-500/20" :
              visualState === "thinking" ? "scale-105 opacity-60 bg-amber-500/20 animate-pulse" :
              "scale-95 opacity-40 bg-primary/10",
            )}
          />
          
          <div className="relative z-10 flex items-center justify-center">
            {visualState === "speaking" && audioTrack ? (
              <BarVisualizer
                state={state}
                trackRef={audioTrack}
                barCount={9}
                className="h-20 w-36 text-primary"
              />
            ) : visualState === "listening" ? (
              <BarVisualizer
                state="speaking"
                trackRef={localAudioTrack}
                barCount={7}
                className="h-16 w-28 text-emerald-500/60"
              />
            ) : visualState === "thinking" ? (
              <div className="relative flex items-center justify-center">
                <Loader2 className="absolute size-24 animate-[spin_3s_linear_infinite] text-amber-500/30" />
                <Bot className="size-16 text-amber-500/60 animate-pulse" />
              </div>
            ) : (
              <Bot className="size-20 text-muted-foreground/30" />
            )}
          </div>
        </div>

        <div className="min-h-20 w-full max-w-2xl rounded-2xl border border-border/70 bg-muted/20 px-6 py-5 text-center">
          <p className="text-lg leading-8 text-foreground" aria-live="polite">
            {helperText}
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
