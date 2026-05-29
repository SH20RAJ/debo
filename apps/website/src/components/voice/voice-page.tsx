"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Phone,
  PhoneOff,
  Loader2,
  Square,
  Headphones,
  FileText,
  Download,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

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

interface LiveKitConnection {
  sessionId: string;
  url: string;
  token: string;
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
    <Card className="rounded-2xl py-3 hover:shadow-md transition-shadow">
      <CardContent className="px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {session.roomName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(session.createdAt)}
          </p>
        </div>
        <Badge
          variant={session.status === "active" ? "default" : "secondary"}
          className="shrink-0 capitalize"
        >
          {session.status}
        </Badge>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums w-12 text-right">
          {formatDuration(session.durationSeconds)}
        </span>
        {session.sourceId ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download audio"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      ctx.lineWidth = 2;
      const styles = getComputedStyle(document.documentElement);
      ctx.strokeStyle = `oklch(${styles.getPropertyValue("--primary").trim() || "0.7 0.18 145"})`;
      ctx.beginPath();

      const slice = cssWidth / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] ?? 128) / 128.0;
        const y = (v * cssHeight) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += slice;
      }
      ctx.lineTo(cssWidth, cssHeight / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-16 rounded-xl" />;
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
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse shadow-[0_3px_0_var(--border)]">
          <Mic className="w-10 h-10 text-primary-foreground" />
        </div>
        <Badge variant="outline" className="mb-4">
          Connected
        </Badge>
        <p className="text-muted-foreground mb-4">Talking with Debo...</p>
        <Button onClick={onDisconnect} variant="destructive" className="rounded-xl">
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </Button>
      </div>
    </LiveKitRoom>
  );
}

function LiveKitNotConfigured() {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            Voice calls aren&apos;t configured
          </p>
          <p className="text-muted-foreground">
            Set the following environment variables on the server, then redeploy:
          </p>
          <ul className="text-xs font-mono bg-background border rounded-lg p-3 space-y-1">
            <li>LIVEKIT_URL</li>
            <li>LIVEKIT_API_KEY</li>
            <li>LIVEKIT_API_SECRET</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const [callConnecting, setCallConnecting] = useState(false);
  const [callConnection, setCallConnection] = useState<LiveKitConnection | null>(
    null,
  );
  const [liveKitUnavailable, setLiveKitUnavailable] = useState(false);

  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSessions = useCallback(async () => {
    try {
      const data = (await api.voice.list()) as VoiceSession[] | null;
      setSessions(data ?? []);
    } catch {
      // Keep last known sessions; don't toast here to avoid noise on poll.
    }
  }, []);

  useEffect(() => {
    refreshSessions().finally(() => setLoadingSessions(false));
  }, [refreshSessions]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  const stopRecordingResources = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    setAnalyser(null);
  }, []);

  const startRecording = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone is not supported in this browser");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        toast.error("Microphone access denied. Enable it in your browser settings.");
      } else if (name === "NotFoundError") {
        toast.error("No microphone found on this device.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not access microphone",
        );
      }
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream);
    } catch (err) {
      stopRecordingResources();
      toast.error(
        err instanceof Error ? err.message : "Recording is not supported",
      );
      return;
    }
    mediaRecorderRef.current = recorder;

    // Set up analyser for waveform (best-effort).
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const node = ctx.createAnalyser();
        node.fftSize = 1024;
        source.connect(node);
        setAnalyser(node);
      }
    } catch {
      // Waveform is non-essential; ignore failures.
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onerror = (e) => {
      const message =
        (e as unknown as { error?: { message?: string } }).error?.message ??
        "Recorder error";
      toast.error(message);
    };

    recorder.onstop = async () => {
      stopRecordingResources();
      const chunks = chunksRef.current;
      chunksRef.current = [];
      if (chunks.length === 0) {
        toast.error("Recording was empty");
        return;
      }
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const file = new File(
        [blob],
        `voice-note-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`,
        { type: recorder.mimeType || "audio/webm" },
      );
      setUploading(true);
      try {
        await api.media.upload(file);
        toast.success("Voice note saved to memory");
        await refreshSessions();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload voice note";
        toast.error(`Upload failed: ${message}`);
      } finally {
        setUploading(false);
      }
    };

    recorder.start();
    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    setIsRecording(true);
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to stop recording",
        );
      }
    }
    setIsRecording(false);
  };

  const handleRecordToggle = () => {
    if (isRecording) stopRecording();
    else void startRecording();
  };

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
        // Best-effort: server may have already marked it ended via LiveKit webhook.
        const status = (err as { status?: number }).status;
        if (status !== 409 && status !== 404) {
          toast.error(
            err instanceof Error ? err.message : "Failed to close session",
          );
        }
      }
    }
    await refreshSessions();
  }, [callConnection, refreshSessions]);

  const voiceNotes = sessions.filter((s) => s.status !== "active");
  const aiCalls = sessions.filter((s) => s.roomName?.startsWith("debo-voice-"));
  const recordingLabel = `${Math.floor(recordSeconds / 60)}:${String(recordSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Voice</h1>
        <p className="text-muted-foreground mt-1">
          Talk to Debo or record voice notes
        </p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleRecordToggle}
          disabled={uploading}
          aria-pressed={isRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-[0_3px_0_var(--border)] disabled:opacity-60 disabled:cursor-not-allowed",
            isRecording
              ? "bg-destructive text-destructive-foreground scale-105 ring-4 ring-destructive/20 animate-pulse"
              : "bg-primary text-primary-foreground hover:scale-105 active:translate-y-[1px] active:shadow-none",
          )}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        {isRecording ? (
          <div className="w-full max-w-xs space-y-2">
            <Waveform analyser={analyser} />
            <p className="text-center text-sm text-muted-foreground tabular-nums">
              Recording {recordingLabel} - tap to stop
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading voice note..." : "Tap to record a voice note"}
          </p>
        )}
      </div>

      {/* Voice Call Section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Voice Call with Debo
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
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">
                Start a voice conversation with Debo
              </p>
              <Button
                onClick={handleStartCall}
                disabled={callConnecting}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_3px_0_var(--border)]"
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

      {/* Tabs */}
      <Tabs defaultValue="voice-notes">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="voice-notes" className="flex-1">
            Voice Notes
          </TabsTrigger>
          <TabsTrigger value="ai-calls" className="flex-1">
            AI Calls
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="flex-1">
            Transcripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice-notes">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading voice notes...
            </div>
          ) : voiceNotes.length > 0 ? (
            <div className="space-y-3">
              {voiceNotes.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  icon={<Headphones className="w-5 h-5 text-primary" />}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No voice notes yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap the record button above to create your first voice note.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-calls">
          {aiCalls.length > 0 ? (
            <div className="space-y-3">
              {aiCalls.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  icon={<Phone className="w-5 h-5 text-primary" />}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No AI calls yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a call to debrief your day or plan with Debo.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transcripts">
          {voiceNotes.length > 0 ? (
            <div className="space-y-3">
              {voiceNotes.slice(0, 10).map((session) => (
                <Card key={session.id} className="rounded-2xl py-3">
                  <CardContent className="px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{session.roomName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Transcript</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Transcripts will appear here.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Completed transcriptions from your voice notes and calls.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
