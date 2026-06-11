"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Loader2,
  Mic,
  AlertTriangle,
  Headphones,
  Download,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import "@livekit/components-styles";

interface LiveKitConnection {
  sessionId: string;
  url: string;
  token: string;
}

interface VoiceSession {
  id: string;
  roomName: string;
  status: "active" | "completed" | "failed";
  durationSeconds: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  sourceId?: string | null;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionRow({
  session,
  icon,
}: {
  session: VoiceSession;
  icon: React.ReactNode;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!session.sourceId) return;
    setDownloading(true);
    try {
      const result = (await api.sources.getFileUrl(session.sourceId)) as
        | { url?: string }
        | null;
      if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No audio available for this session");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to get download link",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-border/30 bg-card/45 backdrop-blur-sm hover:bg-card/75 transition-all shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-primary/20">
      <CardContent className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(var(--primary-rgb),0.05)]">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate font-[var(--font-nunito)]">
            Conversation Profile
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatDate(session.createdAt)}
          </p>
        </div>
        <Badge
          variant={session.status === "active" ? "default" : "secondary"}
          className={cn(
            "shrink-0 capitalize px-2 py-0.5 text-[10px] rounded-lg",
            session.status === "active" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15"
          )}
        >
          {session.status}
        </Badge>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums w-12 text-right font-medium">
          {formatDuration(session.durationSeconds)}
        </span>
        {session.sourceId ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 rounded-xl hover:bg-accent"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download audio"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            )}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CallRecorder({
  sessionId,
  onRecordingComplete,
}: {
  sessionId: string;
  onRecordingComplete: () => void;
}) {
  const room = useRoomContext();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
    if (!room) return;

    const startRecording = async () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          console.warn("AudioContext not supported, skipping recording.");
          return;
        }

        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const dest = audioCtx.createMediaStreamDestination();
        destinationRef.current = dest;

        // 1. Local mic stream
        try {
          const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const localSource = audioCtx.createMediaStreamSource(localStream);
          localSource.connect(dest);
        } catch (err) {
          console.warn("Failed to capture local mic for call recording", err);
        }

        // 2. Connect any remote audio tracks
        const connectRemoteTrack = (track: any) => {
          if (track.kind === "audio" && track.mediaStreamTrack) {
            try {
              const remoteStream = new MediaStream([track.mediaStreamTrack]);
              const remoteSource = audioCtx.createMediaStreamSource(remoteStream);
              remoteSource.connect(dest);
            } catch (err) {
              console.warn("Failed to connect remote audio track to recorder", err);
            }
          }
        };

        // Find existing remote audio tracks
        room.remoteParticipants.forEach((p: any) => {
          p.trackPublications.forEach((pub: any) => {
            if (pub.track && pub.kind === "audio") {
              connectRemoteTrack(pub.track);
            }
          });
        });

        // Listen for new tracks
        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          connectRemoteTrack(track);
        });

        // Start media recorder on the destination stream
        const recorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const chunks = chunksRef.current;
          let sourceId: string | undefined;
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: "audio/webm" });
            const file = new File(
              [blob],
              `voice-call-${sessionId}.webm`,
              { type: "audio/webm" }
            );

            try {
              const res = await api.media.upload(file);
              if (res && res.id) {
                sourceId = res.id;
              }
            } catch (err) {
              console.error("Failed to upload voice call recording:", err);
            }
          }

          try {
            await api.voice.end(sessionId, sourceId);
            toast.success("Voice call recorded and saved!");
            onRecordingComplete();
          } catch (err) {
            console.error("Failed to save voice call session:", err);
            onRecordingComplete();
          }
        };

        recorder.start();
      } catch (err) {
        console.error("Failed to start call recording", err);
      }
    };

    startRecording();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [room, sessionId, onRecordingComplete]);

  return null;
}

function CallRoom({
  sessionId,
  url,
  token,
  onDisconnect,
  onRecordingComplete,
}: {
  sessionId: string;
  url: string;
  token: string;
  onDisconnect: () => void;
  onRecordingComplete: () => void;
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
      <CallRecorder sessionId={sessionId} onRecordingComplete={onRecordingComplete} />
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
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const refreshSessions = useCallback(async () => {
    try {
      const data = (await api.voice.list()) as VoiceSession[] | null;
      setSessions(data ?? []);
    } catch {
      // ignore
    }
  }, []);

  // Check initial configuration from API
  useEffect(() => {
    api.voice.list()
      .then(() => setLiveKitUnavailable(false))
      .catch((err) => {
        if (err?.status === 503 || err?.body?.service === "livekit") {
          setLiveKitUnavailable(true);
        }
      });
    refreshSessions().finally(() => setLoadingSessions(false));
  }, [refreshSessions]);

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

  const handleEndCall = useCallback(() => {
    setCallConnection(null);
  }, []);

  const handleRecordingFinished = useCallback(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Clean up connection on unmount
  useEffect(() => {
    return () => {
      if (callConnection) {
        api.voice.end(callConnection.sessionId).catch(() => {});
      }
    };
  }, [callConnection]);

  const aiCalls = sessions.filter((s) => s.roomName?.startsWith("debo-voice-"));

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 h-full overflow-y-auto scrollbar-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">Talk to Debo</h1>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Initiate an interactive live call with Debo to brain dump, organize notes, or plan your day.
        </p>
      </div>

      <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md overflow-hidden relative shadow-sm">
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
              sessionId={callConnection.sessionId}
              url={callConnection.url}
              token={callConnection.token}
              onDisconnect={handleEndCall}
              onRecordingComplete={handleRecordingFinished}
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

      {/* Call History / Library */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-sm font-bold text-foreground font-[var(--font-nunito)] flex items-center gap-2 select-none">
          <Headphones className="w-4 h-4 text-primary" />
          Recent AI Conversations
        </h2>
        
        {loadingSessions ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading conversations...
          </div>
        ) : aiCalls.length > 0 ? (
          <div className="space-y-2.5">
            {aiCalls.slice(0, 10).map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                icon={<Phone className="w-5 h-5 text-primary" />}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-card/20">
            <p className="text-xs text-muted-foreground font-medium">No recorded conversations yet.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Your completed Live Calls with Debo will be saved and transcribed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
