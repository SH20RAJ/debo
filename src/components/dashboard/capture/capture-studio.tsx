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
    accent: "text-duo-green",
  },
  {
    id: "video" as const,
    label: "Video",
    icon: Video,
    accent: "text-duo-blue",
  },
  {
    id: "image" as const,
    label: "Pages",
    icon: FileImage,
    accent: "text-duo-orange",
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 bg-duo-polar px-5 py-8 lg:px-8">
      <header className="duo-card grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-duo-swan">
            Debo Studio
          </div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-6xl">
            Capture
          </h1>
          <p className="max-w-2xl text-lg font-bold leading-7 text-duo-wolf">
            Record audio, video, or diary pages. Save it as a journal.
          </p>
        </div>
        <Button asChild variant="duolingo-outline" size="lg">
          <Link href="/chat">Open Chat</Link>
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-3">
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
                "btn-3d btn-3d-white flex h-14 w-full items-center justify-between rounded-2xl border-2 px-4 text-left text-sm font-black uppercase tracking-wider transition",
                mode === item.id
                  ? "border-duo-macaw bg-duo-blue/10 text-duo-blue"
                  : "border-duo-swan bg-background text-duo-eel hover:bg-duo-polar"
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className={cn("h-5 w-5", item.accent)} />
                {item.label}
              </span>
              {mode === item.id ? <CheckCircle2 className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="duo-card min-h-[420px] p-4">
            {mode === "image" ? (
              <div className="flex min-h-[390px] flex-col justify-between gap-4">
                <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-duo-swan bg-background text-center transition hover:bg-duo-polar">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-duo-fox bg-duo-orange/10 text-duo-orange">
                    <Upload className="h-7 w-7" />
                  </div>
                  <span className="text-base font-black uppercase tracking-wider text-duo-eel">
                    Upload diary pages
                  </span>
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
                    <div key={preview.url} className="overflow-hidden rounded-2xl border-2 border-duo-swan bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview.url} alt={preview.name} className="h-40 w-full object-cover" />
                      <div className="truncate px-3 py-2 text-xs font-bold text-duo-wolf">
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
                    className="aspect-video w-full max-w-3xl rounded-2xl border-2 border-duo-swan bg-black object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full max-w-3xl items-center justify-center rounded-2xl border-2 border-duo-swan bg-background">
                    <Mic2 className={cn("h-16 w-16", status === "recording" ? "text-duo-green animate-bounce-subtle" : "text-duo-swan")} />
                  </div>
                )}

                {mode === "audio" && mediaUrl ? (
                  <audio src={mediaUrl} controls className="w-full max-w-3xl" />
                ) : null}

                <div className="flex flex-wrap justify-center gap-3">
                  {status === "recording" ? (
                    <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  ) : (
                    <Button onClick={startRecording} variant="duolingo" size="lg" className="gap-2">
                      {mode === "audio" ? <Mic2 className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                      Record
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="duo-card space-y-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="h-12 rounded-2xl border-2 border-duo-swan text-base font-bold"
            />
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes or transcript..."
              className="min-h-64 resize-none rounded-2xl border-2 border-duo-swan text-base font-bold"
            />
            <Button
              onClick={saveCapture}
              disabled={isSaving || (!notes.trim() && status !== "ready")}
              variant="duolingo-blue"
              size="lg"
              className="w-full gap-2"
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
