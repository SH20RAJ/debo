"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Loader2,
  Mic,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

interface LiveKitConnection {
  sessionId: string;
  url: string;
  token: string;
}

function CallRoom({
  url,
  token,
  onDisconnect,
}: {
  url: string;
  token: string;
  onDisconnect: () => void;
}) {
  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect={true}
      onDisconnected={onDisconnect}
      audio={true}
    >
      <RoomAudioRenderer />
      <div className="text-center py-12 px-6 bg-zinc-950/40 border border-zinc-800/40 rounded-3xl backdrop-blur-md relative overflow-hidden select-none">
        {/* Background Glowing Orb Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Voice Particle Orb */}
        <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-6">
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 opacity-20 blur-md animate-pulse" />
          <span className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 opacity-40 animate-ping [animation-duration:3s]" />
          <span className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 opacity-60 animate-pulse [animation-duration:2s]" />
          <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(var(--primary-rgb),0.5)]">
            <Mic className="w-9 h-9 text-primary-foreground animate-pulse" />
          </div>
        </div>

        <Badge variant="outline" className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 px-3 py-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Voice Session Connected
        </Badge>
        
        <h3 className="text-lg font-bold text-foreground font-[var(--font-nunito)]">Debo Live</h3>
        <p className="text-xs text-muted-foreground mt-1.5 mb-8 max-w-xs mx-auto leading-relaxed">
          Speak naturally. Debo captures details and notes them down in your private memory.
        </p>

        <Button onClick={onDisconnect} variant="destructive" className="rounded-xl px-8 h-11 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md">
          <PhoneOff className="w-4 h-4 mr-2" />
          End Conversation
        </Button>
      </div>
    </LiveKitRoom>
  );
}

function LiveKitNotConfigured() {
  return (
    <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.03] p-6 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="font-semibold text-foreground">
            Voice calls aren&apos;t configured
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Set the following environment variables on your server config or `.env.local` to activate LiveKit voice assistant:
          </p>
          <ul className="text-xs font-mono bg-background/50 border border-border/60 rounded-lg p-3 space-y-1.5 select-all">
            <li>LIVEKIT_URL=wss://your-project.livekit.cloud</li>
            <li>LIVEKIT_API_KEY=your-api-key</li>
            <li>LIVEKIT_API_SECRET=your-api-secret</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function VoiceTalkPage() {
  const [callConnecting, setCallConnecting] = useState(false);
  const [callConnection, setCallConnection] = useState<LiveKitConnection | null>(
    null,
  );
  const [liveKitUnavailable, setLiveKitUnavailable] = useState(false);

  // Check initial configuration from API
  useEffect(() => {
    // Attempt dry-run to check config
    api.voice.list()
      .then(() => setLiveKitUnavailable(false))
      .catch((err) => {
        if (err?.status === 503 || err?.body?.service === "livekit") {
          setLiveKitUnavailable(true);
        }
      });
  }, []);

  const handleStartCall = async () => {
    setCallConnecting(true);
    try {
      const result = (await api.voice.create()) as
        | {
            id: string;
            livekit?: { url: string; token: string; identity: string };
          }
        | null;
      if (result?.livekit?.url && result.livekit.token) {
        setCallConnection({
          sessionId: result.id,
          url: result.livekit.url,
          token: result.livekit.token,
        });
        setLiveKitUnavailable(false);
      } else {
        setLiveKitUnavailable(true);
        toast.error("Voice calls aren't configured yet");
      }
    } catch (err) {
      const status = (err as { status?: number }).status;
      const errBody = (err as { body?: { service?: string } }).body;
      if (status === 503 || errBody?.service === "livekit") {
        setLiveKitUnavailable(true);
        toast.error("Voice calls aren't configured yet");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Failed to start call",
        );
      }
    } finally {
      setCallConnecting(false);
    }
  };

  const handleEndCall = useCallback(async () => {
    const conn = callConnection;
    setCallConnection(null);
    if (conn) {
      try {
        await api.voice.end(conn.sessionId);
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (status !== 409 && status !== 404) {
          toast.error(
            err instanceof Error ? err.message : "Failed to close session",
          );
        }
      }
    }
  }, [callConnection]);

  // Clean up connection on unmount
  useEffect(() => {
    return () => {
      if (callConnection) {
        api.voice.end(callConnection.sessionId).catch(() => {});
      }
    };
  }, [callConnection]);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 h-full overflow-y-auto scrollbar-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">Talk to Debo</h1>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Initiate an interactive live call with Debo to brain dump, organize notes, or plan your day.
        </p>
      </div>

      <Card className="rounded-3xl border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative shadow-sm">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold font-[var(--font-nunito)]">
            <Phone className="w-4 h-4 text-primary" />
            Interactive Voice Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveKitUnavailable ? (
            <LiveKitNotConfigured />
          ) : callConnection ? (
            <CallRoom
              url={callConnection.url}
              token={callConnection.token}
              onDisconnect={handleEndCall}
            />
          ) : (
            <div className="text-center py-10 px-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/[0.08] border border-primary/10 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <Phone className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">Start a Conversation</h3>
              <p className="text-xs text-muted-foreground mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                Debrief your day, plan tasks, or brainstorm ideas directly with Debo in real-time.
              </p>
              <Button
                onClick={handleStartCall}
                disabled={callConnecting}
                className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {callConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Start Call
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
