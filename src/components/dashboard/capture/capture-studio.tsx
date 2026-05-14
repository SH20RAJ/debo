"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AudioLines, CheckCircle2, HardDrive, Loader2, Mic2, RotateCcw, Square, Video, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { getComposioActiveApps } from "@/actions/composio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CaptureMode = "audio" | "video";
type CaptureStatus = "idle" | "recording" | "ready";

const modes: Array<{ id: CaptureMode; label: string; icon: LucideIcon }> = [
  { id: "audio", label: "Audio", icon: Mic2 },
  { id: "video", label: "Video", icon: Video },
];

const audioBars = [36, 62, 46, 82, 54, 74, 42, 68, 50, 88, 58, 40];

function getMediaExtension(blob: Blob | null, mode: CaptureMode) {
  const mimeType = blob?.type.split(";")[0].toLowerCase();
  const byMime: Record<string, string> = {
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/webm": "webm",
    "video/mp4": "mp4",
    "video/ogg": "ogv",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };

  return (mimeType && byMime[mimeType]) || (mode === "video" ? "webm" : "webm");
}

function safeFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "journal";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function CaptureStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialMode = typeParam === "video" ? "video" : "audio";

  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCheckingApps, setIsCheckingApps] = useState(true);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTitling, startTitleTransition] = useTransition();

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupUrl = useCallback(() => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  }, [mediaUrl]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resetCapture = useCallback(() => {
    stopStream();
    cleanupUrl();
    chunksRef.current = [];
    setStatus("idle");
    setMediaBlob(null);
    setMediaUrl(null);
    setTimer(0);
    setTitle("");
    setTitleTouched(false);
  }, [cleanupUrl, stopStream]);

  useEffect(() => {
    return () => {
      stopStream();
      cleanupUrl();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cleanupUrl, stopStream]);

  useEffect(() => {
    async function checkDrive() {
      setIsCheckingApps(true);
      try {
        const apps = await getComposioActiveApps();
        setIsDriveConnected(apps.some((app) => app.slug === "googledrive"));
      } catch {
        setIsDriveConnected(false);
      } finally {
        setIsCheckingApps(false);
      }
    }

    void checkDrive();
  }, []);

  useEffect(() => {
    if (status !== "recording") {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((value) => value + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "ready" || titleTouched) return;

    const timeout = window.setTimeout(() => {
      startTitleTransition(async () => {
        const { generateCaptureTitle } = await import("@/actions/media-journals");
        const result = await generateCaptureTitle({
          description: notes,
          mediaType: mode,
          duration: timer,
        });
        if (result.success && result.title) setTitle(result.title);
      });
    }, notes.trim() ? 450 : 0);

    return () => window.clearTimeout(timeout);
  }, [mode, notes, status, timer, titleTouched]);

  const startRecording = async () => {
    if (!isDriveConnected) {
      toast.error("Connect Google Drive before recording.");
      return;
    }

    try {
      resetCapture();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video",
      });

      streamRef.current = stream;

      if (mode === "video" && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        stopStream();
        setStatus("ready");
      };

      recorder.start();
      setStatus("recording");
    } catch (error) {
      console.error("Capture start failed:", error);
      toast.error("Allow microphone or camera access to record.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const handleSave = async () => {
    if (!mediaBlob || status !== "ready") return;

    setIsSaving(true);
    try {
      const finalTitle = title.trim() || `${mode === "video" ? "Video" : "Audio"} Journal`;
      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const time = now.toTimeString().slice(0, 5).replace(":", "-");
      const extension = getMediaExtension(mediaBlob, mode);
      const fileName = `${date}_${time}_${safeFilePart(finalTitle)}.${extension}`;

      const formData = new FormData();
      formData.append("file", mediaBlob, fileName);
      formData.append("fileName", fileName);
      formData.append("mediaType", mode);
      formData.append("userId", "");

      const { uploadMediaToDrive, saveAudioJournal, saveVideoJournal } = await import("@/actions/media-journals");
      const upload = await uploadMediaToDrive(formData);

      if (!upload.success || !upload.driveFileId) {
        throw new Error(upload.error || "Google Drive upload failed.");
      }

      const save = mode === "video" ? saveVideoJournal : saveAudioJournal;
      const result = await save({
        title: finalTitle,
        driveFileId: upload.driveFileId,
        driveWebUrl: upload.driveWebUrl,
        transcript: notes,
        duration: timer,
        folderId: upload.folderId,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Journal could not be saved.");
      }

      toast.success(upload.folderPath ? `Saved to ${upload.folderPath}` : "Capture saved");
      router.push(`/dashboard/journal/${mode}/${result.data}`);
    } catch (error) {
      console.error("Capture save failed:", error);
      toast.error(error instanceof Error ? error.message : "Capture could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeMode = modes.find((item) => item.id === mode)!;
  const canSave = status === "ready" && Boolean(mediaBlob) && isDriveConnected;

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Capture</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Record a journal</h1>
          </div>

          <div className="flex rounded-lg border border-border bg-muted/20 p-1">
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMode(item.id);
                  resetCapture();
                }}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
                  mode === item.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {!isCheckingApps && !isDriveConnected ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5" />
              <span>Google Drive is required for audio and video journals.</span>
              <Button size="sm" variant="outline" className="ml-auto rounded-lg" onClick={() => router.push("/dashboard/connectors")}>
                Connect
              </Button>
            </div>
          </div>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="relative flex aspect-video min-h-[320px] items-center justify-center overflow-hidden rounded-lg border border-border bg-black">
            {mode === "video" && status === "recording" ? (
              <video ref={liveVideoRef} muted playsInline autoPlay className="h-full w-full object-cover" />
            ) : mode === "video" && mediaUrl ? (
              <video src={mediaUrl} controls className="h-full w-full object-contain" />
            ) : mediaUrl ? (
              <audio src={mediaUrl} controls className="relative z-10 w-full max-w-md" />
            ) : (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                  <activeMode.icon className="h-10 w-10" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {status === "recording" ? "Recording" : "Ready"}
                  </div>
                  <div className="mt-1 text-sm text-white/50">{formatTime(timer)}</div>
                </div>
              </div>
            )}

            {mode === "audio" && status === "recording" ? (
              <div className="absolute inset-x-0 bottom-16 flex items-end justify-center gap-2">
                {audioBars.map((height, index) => (
                  <span
                    key={index}
                    className="w-1.5 rounded-full bg-primary/70"
                    style={{ height: `${height}px`, animation: `pulse 1.1s ${index * 70}ms infinite ease-in-out` }}
                  />
                ))}
              </div>
            ) : null}

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <span className={cn("h-2 w-2 rounded-full", status === "recording" ? "bg-red-500" : status === "ready" ? "bg-green-500" : "bg-white/40")} />
              {status === "recording" ? "Recording" : status === "ready" ? "Ready to save" : "Idle"}
            </div>

            <div className="absolute bottom-5 flex items-center gap-3">
              {status === "recording" ? (
                <Button onClick={stopRecording} variant="destructive" className="h-12 rounded-full px-6">
                  <Square className="mr-2 h-4 w-4 fill-current" />
                  Stop
                </Button>
              ) : (
                <Button onClick={startRecording} disabled={isCheckingApps || !isDriveConnected} className="h-12 rounded-full px-6">
                  {status === "ready" ? <RotateCcw className="mr-2 h-4 w-4" /> : <AudioLines className="mr-2 h-4 w-4" />}
                  {status === "ready" ? "Record again" : `Start ${activeMode.label}`}
                </Button>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Title</label>
              <div className="relative">
                <Input
                  value={title}
                  onChange={(event) => {
                    setTitleTouched(true);
                    setTitle(event.target.value);
                  }}
                  placeholder="Auto title after recording"
                  className="h-12 rounded-lg pr-10"
                />
                {isTitling ? <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" /> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Description</label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What happened? Add people, mood, place, or anything worth remembering."
                className="min-h-48 resize-none rounded-lg"
              />
            </div>

            <Button onClick={handleSave} disabled={!canSave || isSaving} className="mt-auto h-12 rounded-lg">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save and sync
            </Button>
          </aside>
        </section>
      </div>
    </div>
  );
}
