"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  FileImage,
  Loader2,
  Mic2,
  Square,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { saveJournal } from "@/actions/journals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CaptureMode = "audio" | "video" | "image";

type ImagePreview = {
  name: string;
  url: string;
};

const modes = [
  {
    id: "audio" as const,
    label: "Audio",
    icon: Mic2,
    accent: "text-emerald-600",
  },
  {
    id: "video" as const,
    label: "Video",
    icon: Video,
    accent: "text-sky-600",
  },
  {
    id: "image" as const,
    label: "Pages",
    icon: FileImage,
    accent: "text-amber-600",
  },
];

export function CaptureStudio() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<CaptureMode>("audio");
  const [status, setStatus] = useState<"idle" | "recording" | "ready">("idle");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("");
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      cleanupStream();
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews, mediaUrl]);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  };

  const resetMedia = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setMediaType("");
    chunksRef.current = [];
  };

  const startRecording = async () => {
    try {
      resetMedia();
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Recording is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia(
        mode === "audio" ? { audio: true } : { audio: true, video: true }
      );
      streamRef.current = stream;

      if (mode === "video" && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play();
      }

      const preferredType =
        mode === "audio"
          ? MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : ""
          : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : MediaRecorder.isTypeSupported("video/webm")
              ? "video/webm"
              : "";
      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: preferredType || recorder.mimeType });
        setMediaType(preferredType || recorder.mimeType);
        setMediaUrl(URL.createObjectURL(blob));
        setStatus("ready");
        cleanupStream();
      };

      recorder.start();
      setStatus("recording");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start capture");
      cleanupStream();
      setStatus("idle");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleImages = (files: FileList | null) => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    const previews = Array.from(files ?? []).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(previews);
    if (previews.length > 0) setStatus("ready");
  };

  const saveCapture = async () => {
    const captureTitle = title.trim() || `${modes.find((item) => item.id === mode)?.label} journal`;
    const body = buildJournalContent(captureTitle);
    if (!body.trim()) {
      toast.error("Add a note before saving");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveJournal(body, undefined, captureTitle, undefined, [
        `${mode}-journal`,
        "capture",
      ]);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Could not save capture");
      }
      toast.success("Capture saved");
      router.push(`/dashboard/journal/${result.data}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save capture");
    } finally {
      setIsSaving(false);
    }
  };

  const buildJournalContent = (captureTitle: string) => {
    const lines = [
      `# ${captureTitle}`,
      "",
      `Capture type: ${mode}`,
      mediaUrl ? `Recorded media: ${mediaType || "browser recording"}` : "",
      imagePreviews.length
        ? `Image pages: ${imagePreviews.map((preview) => preview.name).join(", ")}`
        : "",
      "",
      notes.trim(),
    ].filter(Boolean);

    return lines.join("\n");
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:px-8">
      <header className="grid gap-5 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Debo Studio
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Capture
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Record a thought, keep a private vlog, or collect diary pages into one journal-ready note.
          </p>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-md">
          <Link href="/chat">Open Chat</Link>
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          {modes.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (status === "recording") return;
                setMode(item.id);
                setStatus("idle");
                resetMedia();
              }}
              className={cn(
                "flex h-12 w-full items-center justify-between rounded-md border px-3 text-left text-sm font-medium transition",
                mode === item.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", mode === item.id ? "text-background" : item.accent)} />
                {item.label}
              </span>
              {mode === item.id ? <CheckCircle2 className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-h-[420px] rounded-lg border border-border bg-muted/20 p-4">
            {mode === "image" ? (
              <div className="flex min-h-[390px] flex-col justify-between gap-4">
                <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-background text-center transition hover:bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload diary pages</span>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleImages(event.target.files)}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {imagePreviews.map((preview) => (
                    <div key={preview.url} className="overflow-hidden rounded-md border border-border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview.url} alt={preview.name} className="h-40 w-full object-cover" />
                      <div className="truncate px-3 py-2 text-xs text-muted-foreground">
                        {preview.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[390px] flex-col items-center justify-center gap-5">
                {mode === "video" ? (
                  <video
                    ref={liveVideoRef}
                    src={mediaUrl ?? undefined}
                    controls={Boolean(mediaUrl)}
                    muted={status === "recording"}
                    playsInline
                    className="aspect-video w-full max-w-3xl rounded-md border border-border bg-black object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full max-w-3xl items-center justify-center rounded-md border border-border bg-background">
                    <Mic2 className={cn("h-14 w-14", status === "recording" ? "text-emerald-500" : "text-muted-foreground")} />
                  </div>
                )}

                {mode === "audio" && mediaUrl ? (
                  <audio src={mediaUrl} controls className="w-full max-w-3xl" />
                ) : null}

                <div className="flex flex-wrap justify-center gap-3">
                  {status === "recording" ? (
                    <Button onClick={stopRecording} variant="destructive" className="h-10 rounded-md gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  ) : (
                    <Button onClick={startRecording} className="h-10 rounded-md gap-2">
                      {mode === "audio" ? <Mic2 className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                      Record
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="h-11 rounded-md"
            />
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Transcript, OCR text, or quick notes..."
              className="min-h-64 resize-none rounded-md"
            />
            <Button
              onClick={saveCapture}
              disabled={isSaving || (!notes.trim() && status !== "ready")}
              className="h-11 w-full rounded-md gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Journal
            </Button>
          </aside>
        </div>
      </section>
    </div>
  );
}
