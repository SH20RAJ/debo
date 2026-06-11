"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Loader2,
  Square,
  Headphones,
  FileText,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
            {session.roomName}
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

function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let raf = 0;
    let phase = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = Math.max(0.08, average / 128);

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const styles = getComputedStyle(document.documentElement);
      const primaryColor = `oklch(${styles.getPropertyValue("--primary").trim() || "0.7 0.18 145"})`;

      const waveConfigs = [
        { opacity: 0.85, frequency: 0.05, speed: 0.08, amplitude: 35, lineWidth: 2.5 },
        { opacity: 0.45, frequency: 0.08, speed: -0.05, amplitude: 22, lineWidth: 1.5 },
        { opacity: 0.25, frequency: 0.03, speed: 0.03, amplitude: 14, lineWidth: 1.0 },
      ];

      phase += 0.12;

      waveConfigs.forEach((cfg) => {
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = cfg.opacity;
        ctx.lineWidth = cfg.lineWidth;
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = primaryColor;

        ctx.beginPath();
        
        const points: { x: number; y: number }[] = [];
        const numPoints = 12;
        
        for (let i = 0; i <= numPoints; i++) {
          const ratio = i / numPoints;
          const x = ratio * cssWidth;
          const envelope = Math.sin(ratio * Math.PI); 
          const sine = Math.sin(ratio * Math.PI * 2 * (1 / cfg.frequency) + phase * cfg.speed);
          const y = (cssHeight / 2) + sine * cfg.amplitude * volume * envelope;
          points.push({ x, y });
        }

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-20 rounded-2xl bg-muted/20 border border-border/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.02)]" />;
}

export function VoiceNotesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

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
      // Keep last known sessions
    }
  }, []);

  useEffect(() => {
    refreshSessions().finally(() => setLoadingSessions(false));
  }, [refreshSessions]);

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
        node.fftSize = 256;
        source.connect(node);
        setAnalyser(node);
      }
    } catch {
      // Waveform is non-essential
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

  const voiceNotes = sessions.filter((s) => s.status !== "active" && !s.roomName?.startsWith("debo-voice-"));
  const aiCalls = sessions.filter((s) => s.roomName?.startsWith("debo-voice-"));
  const recordingLabel = `${Math.floor(recordSeconds / 60)}:${String(recordSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 h-full overflow-y-auto scrollbar-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">Voice Notes</h1>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Record voice notes to capture thoughts instantly. Everything is automatically transcribed and structured.
        </p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-4 py-6 bg-card/10 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <>
              <span className="absolute inline-flex h-24 w-24 rounded-full bg-destructive/15 animate-ping [animation-duration:1.8s]" />
              <span className="absolute inline-flex h-28 w-28 rounded-full bg-destructive/5 animate-pulse [animation-duration:1.2s]" />
            </>
          )}
          <button
            type="button"
            onClick={handleRecordToggle}
            disabled={uploading}
            aria-pressed={isRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed z-10",
              isRecording
                ? "bg-destructive text-destructive-foreground scale-105 shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(var(--primary-rgb),0.25)] hover:shadow-[0_8px_30px_rgba(var(--primary-rgb),0.4)]",
            )}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <Square className="w-7 h-7 fill-current" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {isRecording ? (
          <div className="w-full max-w-sm space-y-4 mt-2">
            <Waveform analyser={analyser} />
            <p className="text-center text-xs text-muted-foreground font-semibold tracking-wider uppercase tabular-nums">
              Recording {recordingLabel} • Click button to stop & save
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-medium">
            {uploading ? "Saving note to your past..." : "Tap the mic node to record a voice note"}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="voice-notes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="voice-notes" className="rounded-xl text-xs py-2 font-[var(--font-nunito)]">
            Voice Notes
          </TabsTrigger>
          <TabsTrigger value="ai-calls" className="rounded-xl text-xs py-2 font-[var(--font-nunito)]">
            AI Calls
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="rounded-xl text-xs py-2 font-[var(--font-nunito)]">
            Transcripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice-notes" className="mt-4 outline-none">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading voice notes...
            </div>
          ) : voiceNotes.length > 0 ? (
            <div className="space-y-2.5">
              {voiceNotes.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  icon={<Headphones className="w-5 h-5 text-primary" />}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
              <p className="text-xs text-muted-foreground font-medium">No voice notes yet.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Tap the record button above to capture your first voice note.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-calls" className="mt-4 outline-none">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading AI calls...
            </div>
          ) : aiCalls.length > 0 ? (
            <div className="space-y-2.5">
              {aiCalls.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  icon={<Headphones className="w-5 h-5 text-primary" />}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
              <p className="text-xs text-muted-foreground font-medium">No AI calls yet.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Start a call under 'Talk to Debo' to debrief your day or plan.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transcripts" className="mt-4 outline-none">
          {voiceNotes.length > 0 ? (
            <div className="space-y-2.5">
              {voiceNotes.slice(0, 10).map((session) => (
                <Card key={session.id} className="rounded-2xl border-border/30 bg-card/40 hover:bg-card/75 transition-all shadow-sm">
                  <CardContent className="px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground/80" />
                      <div>
                        <p className="text-xs font-semibold text-foreground font-[var(--font-nunito)]">{session.roomName}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="px-2 py-0.5 text-[9px] rounded-lg bg-accent border border-border/20 text-muted-foreground font-semibold">
                      Transcript Ready
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
              <p className="text-xs text-muted-foreground font-medium">Transcripts will appear here.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Completed transcriptions from your voice notes and calls.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
