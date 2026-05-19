"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Video, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type CaptureState = "idle" | "requesting" | "recording" | "stopping" | "uploading" | "processing" | "done" | "error";

interface VideoCaptureProps {
  onTranscriptReady?: (transcript: string, sourceId: string) => void;
}

export function VideoCapture({ onTranscriptReady }: VideoCaptureProps) {
  const [state, setState] = useState<CaptureState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    setState("requesting");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        cleanup();
        await uploadVideo(blob);
      };

      recorder.start(1000);
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err: any) {
      setState("error");
      setErrorMsg(err.name === "NotAllowedError" ? "Camera/mic permission denied" : err.message);
    }
  };

  const stopRecording = () => {
    setState("stopping");
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  };

  const uploadVideo = async (blob: Blob) => {
    setState("uploading");
    try {
      // Convert blob to base64 for simple transport
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const result = await api.journal.create({
        title: `Video ${new Date().toLocaleString()}`,
        content: "",
        type: "video",
        media: base64,
        mimeType: "video/webm",
        status: "processing",
      });

      setState("processing");

      // Simulate transcript generation (in production, this would be a background job)
      // Poll for completion or use a callback
      setTimeout(() => {
        const transcript = "[Video transcript will appear here once processing completes]";
        setState("done");
        onTranscriptReady?.(transcript, result.id);

        // Reset after a few seconds
        setTimeout(() => setState("idle"), 3000);
      }, 2000);
    } catch (err: any) {
      setState("error");
      setErrorMsg(err.message ?? "Upload failed");
    }
  };

  return (
    <div className="space-y-3">
      {/* Video preview */}
      {(state === "recording" || state === "requesting" || state === "stopping") && (
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-[240px]">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline />
          {state === "recording" && (
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 rounded px-2 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white font-mono">{formatTime(elapsed)}</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {state === "idle" || state === "error" || state === "done" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={startRecording}
            className="gap-1.5 text-xs"
          >
            <Video className="w-3.5 h-3.5" />
            Record Video
          </Button>
        ) : state === "recording" ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={stopRecording}
            className="gap-1.5 text-xs"
          >
            <Square className="w-3.5 h-3.5" />
            Stop ({formatTime(elapsed)})
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="gap-1.5 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {state === "requesting" && "Opening camera..."}
            {state === "stopping" && "Stopping..."}
            {state === "uploading" && "Uploading..."}
            {state === "processing" && "Generating transcript..."}
          </Button>
        )}

        {/* Status messages */}
        {state === "done" && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
        {state === "error" && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </span>
        )}
      </div>
    </div>
  );
}
