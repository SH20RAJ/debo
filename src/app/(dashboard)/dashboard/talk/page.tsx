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
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, PhoneOff, Radio, Bot, Settings, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type VoiceSession = {
  token: string;
  serverUrl: string;
  roomName: string;
};

type VoiceTokenResponse = Partial<VoiceSession> & {
  error?: string;
};

export default function TalkPage() {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/livekit/token", { cache: "no-store" });
      const data = (await res.json()) as VoiceTokenResponse;

      if (!res.ok || !data.token || !data.serverUrl || !data.roomName) {
        throw new Error(data.error || "Failed to connect");
      }

      setSession({
        token: data.token,
        serverUrl: data.serverUrl,
        roomName: data.roomName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071112] via-[#0a1014] to-[#071112] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#091416]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="relative h-10 w-10 rounded-lg border border-white/10 bg-white/5 p-1.5 shadow-sm">
              <Image src="/mascot.png" alt="Debo" fill className="object-contain p-1" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">Debo</p>
              <p className="text-sm font-extrabold text-white/85">Voice Chat</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-emerald-300/40 hover:text-emerald-200"
              aria-label="Text chat"
            >
              <Home className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-emerald-300/40 hover:text-emerald-200"
              aria-label="Dashboard"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {!session ? (
          <div className="flex flex-col items-center gap-8 text-center">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-emerald-300/30 bg-emerald-300/5">
                <Bot className="h-20 w-20 text-emerald-300/50" />
              </div>
              {/* Pulsing rings */}
              <div className="absolute inset-0 flex animate-pulse items-center justify-center rounded-full">
                <div className="h-44 w-44 rounded-full border border-emerald-300/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full">
                <div className="h-48 w-48 rounded-full border border-emerald-300/10" />
              </div>
            </div>

            {/* Text */}
            <div className="max-w-md space-y-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Talk with Debo</h1>
              <p className="text-white/50">
                Voice chat powered by LiveKit. Speak naturally and Debo will listen, think, and respond with memory awareness.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={startSession}
              disabled={isConnecting}
              className="h-14 gap-3 rounded-2xl bg-emerald-300 px-8 text-lg font-black uppercase tracking-wider text-[#071112] shadow-lg shadow-emerald-300/25 transition-all hover:bg-emerald-200 hover:shadow-emerald-300/40 active:scale-95"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Voice Chat
                </>
              )}
            </Button>

            {/* Tips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-white/30">
              <span className="rounded-full border border-white/10 px-3 py-1">Microphone required</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Memory active</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Real-time AI</span>
            </div>
          </div>
        ) : (
          <LiveKitRoom
            serverUrl={session.serverUrl}
            token={session.token}
            connect
            audio
            video={false}
            onDisconnected={endSession}
            onError={(err) => setError(err.message)}
            className="contents"
          >
            <VoiceChatInterface onEnd={endSession} />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </main>
    </div>
  );
}

function VoiceChatInterface({ onEnd }: { onEnd: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isDeboSpeaking, setIsDeboSpeaking] = useState(false);

  useEffect(() => {
    setIsMuted(!localParticipant.isMicrophoneEnabled);
    setIsDeboSpeaking(state === "speaking");
  }, [localParticipant.isMicrophoneEnabled, state]);

  const toggleMute = async () => {
    const nextMuted = !isMuted;
    await localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
  };

  const stateLabel = state === "speaking" ? "Speaking" : state === "listening" ? "Listening" : "Connected";
  const stateColor = state === "speaking" ? "text-emerald-300" : state === "listening" ? "text-amber-300" : "text-white/50";

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Debo Avatar */}
      <div className={cn("relative transition-all duration-500", isDeboSpeaking && "scale-105")}>
        <div
          className={cn(
            "flex h-48 w-48 items-center justify-center rounded-full border-4 transition-all duration-300",
            isDeboSpeaking
              ? "border-emerald-300 bg-emerald-300/20 shadow-[0_0_60px_rgba(52,211,153,0.4)]"
              : state === "listening"
              ? "border-amber-300 bg-amber-300/10 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
              : "border-white/20 bg-white/5"
          )}
        >
          <Bot className={cn("h-20 w-20 transition-all", isDeboSpeaking ? "text-emerald-300" : state === "listening" ? "text-amber-300" : "text-white/50")} />
        </div>

        {/* Pulsing rings when active */}
        {(state === "speaking" || state === "listening") && (
          <div
            className={cn(
              "absolute inset-0 animate-ping rounded-full border-2 opacity-50",
              state === "speaking" ? "border-emerald-300" : "border-amber-300"
            )}
            style={{ animationDuration: "2s" }}
          />
        )}

        {/* Audio visualizer when speaking */}
        {audioTrack && state === "speaking" && (
          <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-1.5 rounded-full bg-emerald-300 animate-bounce"
                style={{ animationDelay: `${i * 60}ms`, height: `${16 + Math.sin(i * 0.8) * 12}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Radio className={cn("h-4 w-4", stateColor)} />
          <span className={cn("text-sm font-black uppercase tracking-[0.2em]", stateColor)}>{stateLabel}</span>
        </div>
        <p className="text-xs text-white/30">Debo is ready to talk with your memories</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all",
            isMuted
              ? "border-amber-300/50 bg-amber-300/10 text-amber-300 hover:bg-amber-300/20"
              : "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10"
          )}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onEnd}
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-300/50 bg-rose-300/10 text-rose-300 transition-all hover:border-rose-300 hover:bg-rose-300/20 active:scale-95"
        >
          <PhoneOff className="h-8 w-8" />
        </button>

        {/* Placeholder for symmetry */}
        <div className="h-16 w-16" />
      </div>

      {/* Tips */}
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-white/30">
        <span className="rounded-full border border-white/10 px-3 py-1">Click mic to mute/unmute</span>
        <span className="rounded-full border border-white/10 px-3 py-1">Click phone to end</span>
      </div>
    </div>
  );
}