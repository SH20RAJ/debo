"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Video, Square, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface VideoCaptureProps {
  onTranscriptReady: (transcript: string, sourceId: string) => void;
}

export function VideoCapture({ onTranscriptReady }: VideoCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setProcessing(true);
        try {
          const title = "Video Journal - " + new Date().toLocaleDateString();
          const result = await api.sources.create({ type: "video", title, description: "Video recording" });
          onTranscriptReady("Video recorded. Transcript will be generated.", result.id);
        } catch (err) {
          console.error("Failed to save video:", err);
        } finally {
          setProcessing(false);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [onTranscriptReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  return (
    <div className="flex items-center gap-2 flex-1">
      {recording && (
        <video ref={videoRef} autoPlay muted className="w-16 h-12 rounded-lg bg-black object-cover" />
      )}
      {processing ? (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Processing video...
        </span>
      ) : recording ? (
        <Button variant="destructive" size="sm" className="h-7 gap-1.5 text-xs" onClick={stopRecording}>
          <Square className="w-3 h-3" />
          Stop
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" onClick={startRecording}>
          <Video className="w-3.5 h-3.5" />
          Record
        </Button>
      )}
    </div>
  );
}
