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
  Volume2,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
}: {
  session: VoiceSession;
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
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/20 bg-zinc-950/20 hover:bg-zinc-900/35 transition-all duration-300">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Volume2 className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate font-[var(--font-nunito)]">
            Debo Voice Conversation
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(session.createdAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(session.durationSeconds)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn(
            "capitalize px-2 py-0.5 text-[9px] font-semibold rounded-lg border-border/30 bg-zinc-900/40 text-muted-foreground",
            session.status === "active" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          )}
        >
          {session.status}
        </Badge>

        {session.sourceId && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl border border-border/30 bg-zinc-900/10 hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download call audio"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
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

        room.remoteParticipants.forEach((p: any) => {
          p.trackPublications.forEach((pub: any) => {
            if (pub.track && pub.kind === "audio") {
              connectRemoteTrack(pub.track);
            }
          });
        });

        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          connectRemoteTrack(track);
        });

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
              const res = await api.media.upload(file, "voice", sessionId);
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
      
      <div className="text-center py-16 px-6 bg-zinc-950/20 border border-border/20 rounded-3xl backdrop-blur-md relative overflow-hidden select-none">
        
        {/* Dynamic visual pulsing particles behind orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Glowing breathing Orb */}
        <div className="relative flex items-center justify-center w-28 h-28 mx-auto mb-8">
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 opacity-20 blur-md animate-pulse [animation-duration:1.5s]" />
          <span className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 opacity-40 animate-ping [animation-duration:2.5s]" />
          <span className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 opacity-60 animate-pulse [animation-duration:1.2s]" />
          <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(88,204,2,0.3)]">
            <Mic className="w-7 h-7 text-primary-foreground animate-pulse" />
          </div>
        </div>

        {/* Status badges */}
        <Badge variant="outline" className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 px-3 py-1 text-[10px] rounded-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active Live Session
        </Badge>
        
        <h3 className="text-base font-bold text-foreground font-[var(--font-nunito)]">Talking to Debo</h3>
        <p className="text-[11px] text-muted-foreground mt-2 mb-8 max-w-xs mx-auto leading-relaxed">
          Start speaking naturally. Your conversation is encrypted, transcribed, and extracted into memories in real-time.
        </p>

        {/* Waveform Visualizer simulation */}
        <div className="flex items-end justify-center gap-1.5 h-6 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
            <div
              key={idx}
              className="w-[3px] bg-primary/60 rounded-full animate-pulse"
              style={{
                height: `${Math.max(15, (val / 10) * 100)}%`,
                animationDelay: `${idx * 0.08}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>

        <Button
          onClick={onDisconnect}
          variant="destructive"
          className="rounded-xl px-7 h-10 hover:scale-[1.01] active:scale-[0.99] transition shadow-md bg-destructive hover:bg-destructive/90 text-xs font-semibold"
        >
          <PhoneOff className="w-3.5 h-3.5 mr-2" />
          End Conversation
        </Button>
      </div>
    </LiveKitRoom>
  );
}

function LiveKitNotConfigured() {
  return (
    <div className="rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/[0.02] p-5 text-xs">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4.5 h-4.5 text-amber-500 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="font-semibold text-foreground">
            Voice Server Credentials Missing
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Ensure the following environment variables are set in your local configurations to activate the LiveKit voice engine:
          </p>
          <ul className="text-[10px] font-mono bg-zinc-950/40 border border-border/10 rounded-xl p-3 space-y-1.5 select-all">
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

  useEffect(() => {
    return () => {
      if (callConnection) {
        api.voice.end(callConnection.sessionId).catch(() => {});
      }
    };
  }, [callConnection]);

  const aiCalls = sessions.filter((s) => s.roomName?.startsWith("debo-voice-"));

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 h-full overflow-y-auto scrollbar-none bg-gradient-to-b from-[#090d08] via-[#0b100a] to-[#080b07]">
      {/* Visual background lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 font-[var(--font-nunito)]">
          <Mic className="w-5 h-5 text-primary" />
          Talk to Debo
        </h1>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Initiate an interactive live connection with your memory processor to brain-dump thoughts, organize ideas, and reflect on your goals.
        </p>
      </div>

      <Card className="rounded-3xl border border-border/20 bg-zinc-950/20 backdrop-blur-md overflow-hidden relative shadow-sm">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="pb-3 border-b border-border/10 bg-zinc-950/40">
          <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground font-[var(--font-nunito)]">
            <Phone className="w-3.5 h-3.5 text-primary" />
            Interactive Voice Console
          </CardTitle>
          <CardDescription className="text-[10px]">Connected via secure live WebRTC streaming</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/[0.08] border border-primary/15 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Mic className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">Initialize Voice Link</h3>
              <p className="text-xs text-muted-foreground mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                Connect and speak. Debo automatically processes speech, extracts actionable tasks, and saves the recording.
              </p>
              <Button
                onClick={handleStartCall}
                disabled={callConnecting}
                className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 hover:scale-[1.01] active:scale-[0.99] transition text-xs h-10 shadow-sm"
              >
                {callConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Connecting Synapse...
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call History / Library */}
      <div className="space-y-4 pt-4 border-t border-border/20">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-[var(--font-nunito)] flex items-center gap-2 select-none">
          <Headphones className="w-4 h-4 text-primary" />
          Recent AI Conversations
        </h2>
        
        {loadingSessions ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Retrieving call logs...
          </div>
        ) : aiCalls.length > 0 ? (
          <div className="space-y-2.5">
            {aiCalls.slice(0, 8).map((session) => (
              <SessionRow
                key={session.id}
                session={session}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border/20 rounded-2xl bg-zinc-950/20 p-6">
            <p className="text-xs font-semibold text-muted-foreground">No recorded sessions yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-xs mx-auto leading-relaxed">
              Once you complete an interactive session, your transcript and audio link will populate here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
