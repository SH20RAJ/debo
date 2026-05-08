"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  Camera,
  CheckCircle2,
  FileImage,
  Loader2,
  Mic2,
  Sparkles,
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
  file: File;
  name: string;
  url: string;
};

type UploadedMedia = {
  key: string;
  uri: string;
  url: string | null;
  fileName: string;
  contentType: string;
  kind: CaptureMode;
  size: number;
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
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("");
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const hasMedia = mode === "image" ? imagePreviews.length > 0 : Boolean(mediaUrl);

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
    setMediaBlob(null);
    setMediaUrl(null);
    setMediaType("");
    chunksRef.current = [];
  };

  const resetImages = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setImagePreviews([]);
  };

  const startRecording = async () => {
    try {
      resetMedia();
      resetImages();
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
        setMediaBlob(blob);
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
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(previews);
    setStatus(previews.length > 0 ? "ready" : "idle");
  };

  const saveCapture = async () => {
    const captureTitle = title.trim() || `${modes.find((item) => item.id === mode)?.label} journal`;
    if (!notes.trim() && status !== "ready") {
      toast.error("Add a note before saving");
      return;
    }

    setIsSaving(true);
    try {
      const uploadedMedia = await uploadCaptureMedia();
      const body = buildJournalContent(captureTitle, uploadedMedia);
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

  const uploadCaptureMedia = async () => {
    if (mode === "image") {
      return Promise.all(imagePreviews.map((preview) => uploadMediaFile(preview.file, "image")));
    }

    if (status !== "ready") {
      return [];
    }

    if (!mediaBlob) {
      throw new Error("No recorded media found. Please record again.");
    }

    return [await uploadMediaFile(createRecordedFile(), mode)];
  };

  const createRecordedFile = () => {
    if (!mediaBlob) {
      throw new Error("No recorded media found. Please record again.");
    }

    const extension = mediaType.includes("mp4") ? "mp4" : "webm";
    const fileName = `${mode}-journal-${Date.now()}.${extension}`;

    return new File([mediaBlob], fileName, { type: mediaType || mediaBlob.type });
  };

  const uploadMediaFile = async (file: File, kind: CaptureMode): Promise<UploadedMedia> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/capture/media", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json().catch(() => ({}))) as {
      media?: UploadedMedia;
      error?: string;
    };

    if (!response.ok || !payload.media) {
      throw new Error(payload.error || "Could not upload media");
    }

    return payload.media;
  };

  const buildJournalContent = (captureTitle: string, uploadedMedia: UploadedMedia[]) => {
    const capturedAt = new Date().toISOString();
    const lines = [
      `# ${captureTitle}`,
      "",
      "Palace index:",
      "@w life",
      `@r ${capturedAt.slice(0, 10)}`,
      `@d ${mode}-${capturedAt}`,
      `@m ${mode}`,
      `@t ${capturedAt}`,
      "",
      `Capture type: ${mode}`,
      mediaUrl ? `Recorded media: ${mediaType || "browser recording"}` : "",
      imagePreviews.length
        ? `Image pages: ${imagePreviews.map((preview) => preview.name).join(", ")}`
        : "",
      uploadedMedia.length ? "Stored media:" : "",
      ...uploadedMedia.map(
        (item) =>
          `- ${item.kind}: ${item.fileName} (${formatBytes(item.size)}) ${item.url || item.uri}`
      ),
      "",
      notes.trim() ? "Verbatim note:" : "",
      notes.trim(),
    ].filter(Boolean);

    return lines.join("\n");
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-full bg-duo-polar">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-5 sm:py-6 lg:px-8">
        <header className="duo-card overflow-hidden p-0">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-duo-feather bg-duo-green/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-duo-green">
                <Archive className="h-3.5 w-3.5" />
                Palace capture
              </div>
              <div>
                <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel sm:text-5xl">
                  Open a drawer
                </h1>
                <p className="mt-2 max-w-2xl text-base font-bold leading-7 text-duo-wolf">
                  Save the raw moment first. Debo can index and understand it after.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {[
                ["Wing", "life"],
                ["Room", "today"],
                ["Drawer", activeMode.label.toLowerCase()],
                ["Index", hasMedia ? "ready" : "empty"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border-2 border-duo-swan bg-background px-3 py-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-duo-swan">
                    {label}
                  </div>
                  <div className="truncate text-sm font-black text-duo-eel">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:content-start lg:gap-3">
            {modes.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (status === "recording") return;
                  setMode(item.id);
                  setStatus("idle");
                  resetMedia();
                  resetImages();
                }}
                className={cn(
                  "btn-3d btn-3d-white flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-background px-3 py-3 text-center text-xs font-black uppercase tracking-wider transition lg:min-h-14 lg:flex-row lg:justify-between lg:text-left",
                  mode === item.id
                    ? "border-duo-macaw bg-duo-blue/10 text-duo-blue"
                    : "border-duo-swan text-duo-eel hover:bg-duo-polar"
                )}
              >
                <span className="flex items-center gap-2 lg:gap-3">
                  <item.icon className={cn("h-5 w-5", item.accent)} />
                  {item.label}
                </span>
                {mode === item.id ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="duo-card p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">
                    Verbatim drawer
                  </div>
                  <h2 className="text-xl font-heading font-black text-duo-eel">
                    {activeMode.label} capture
                  </h2>
                </div>
                <div
                  className={cn(
                    "rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                    status === "recording"
                      ? "border-duo-cardinal bg-duo-red/10 text-duo-red"
                      : hasMedia
                        ? "border-duo-feather bg-duo-green/10 text-duo-green"
                        : "border-duo-swan bg-duo-polar text-duo-wolf"
                  )}
                >
                  {status === "recording" ? "Recording" : hasMedia ? "Ready" : "Empty"}
                </div>
              </div>

              {mode === "image" ? (
                <div className="flex min-h-[320px] flex-col gap-4 lg:min-h-[430px]">
                  <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-duo-swan bg-background px-4 text-center transition hover:bg-duo-polar">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-duo-fox bg-duo-orange/10 text-duo-orange">
                      <Upload className="h-7 w-7" />
                    </div>
                    <span className="text-base font-black uppercase tracking-wider text-duo-eel">
                      Upload diary pages
                    </span>
                    <span className="max-w-xs text-sm font-bold text-duo-wolf">
                      Photos are stored as the original drawer.
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleImages(event.target.files)}
                    />
                  </label>
                  {imagePreviews.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {imagePreviews.map((preview) => (
                        <div key={preview.url} className="overflow-hidden rounded-2xl border-2 border-duo-swan bg-background">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview.url} alt={preview.name} className="aspect-[4/3] w-full object-cover" />
                          <div className="truncate px-3 py-2 text-xs font-bold text-duo-wolf">
                            {preview.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 lg:min-h-[430px]">
                  {mode === "video" ? (
                    <video
                      ref={liveVideoRef}
                      src={mediaUrl ?? undefined}
                      controls={Boolean(mediaUrl)}
                      muted={status === "recording"}
                      playsInline
                      className="aspect-video w-full rounded-2xl border-2 border-duo-swan bg-black object-cover"
                    />
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center rounded-2xl border-2 border-duo-swan bg-background sm:h-64">
                      <Mic2 className={cn("h-16 w-16", status === "recording" ? "animate-bounce-subtle text-duo-green" : "text-duo-swan")} />
                    </div>
                  )}

                  {mode === "audio" && mediaUrl ? (
                    <audio src={mediaUrl} controls className="w-full" />
                  ) : null}

                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                    {status === "recording" ? (
                      <Button onClick={stopRecording} variant="destructive" size="lg" className="w-full gap-2 sm:w-auto">
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button onClick={startRecording} variant="duolingo" size="lg" className="w-full gap-2 sm:w-auto">
                        {mode === "audio" ? <Mic2 className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                        Record
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside className="duo-card flex flex-col gap-4 p-4 sm:p-5 xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)]">
              <div className="rounded-2xl border-2 border-duo-swan bg-duo-polar p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-duo-wolf">
                  <BookOpen className="h-4 w-4 text-duo-blue" />
                  Index note
                </div>
                <p className="text-sm font-bold leading-6 text-duo-wolf">
                  Add only what helps future Debo find this drawer.
                </p>
              </div>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                className="h-12 rounded-2xl border-2 border-duo-swan text-base font-bold"
              />
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Notes, transcript, people, promises..."
                className="min-h-44 flex-1 resize-none rounded-2xl border-2 border-duo-swan text-base font-bold xl:min-h-64"
              />
              <Button
                onClick={saveCapture}
                disabled={isSaving || status === "recording" || (!notes.trim() && status !== "ready")}
                variant="duolingo-blue"
                size="lg"
                className="w-full gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Save Drawer
              </Button>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
