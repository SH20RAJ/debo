"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  FileImage,
  Loader2,
  Mic2,
  Sparkles,
  Square,
  Video as VideoIcon,
  Brain,
  History,
  Upload,
  HardDrive,
  Maximize2,
  Minimize2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { saveJournal } from "@/actions/journals";
import { getComposioActiveApps } from "@/actions/composio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CaptureMode = "audio" | "video" | "image";

const modes = [
  { id: "audio" as const, label: "Audio", icon: Mic2, color: "bg-primary", shadow: "shadow-primary/20", accent: "text-primary" },
  { id: "video" as const, label: "Video", icon: VideoIcon, color: "bg-primary/80", shadow: "shadow-primary/20", accent: "text-primary" },
  { id: "image" as const, label: "Photos", icon: FileImage, color: "bg-primary/60", shadow: "shadow-primary/20", accent: "text-primary" },
];

function getMediaExtension(blob: Blob | null, mode: CaptureMode) {
  if (mode === "image") return "jpg";

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

  return (mimeType && byMime[mimeType]) || "webm";
}

function toSafeFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "moment";
}

export function CaptureStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as CaptureMode | null;

  const [mode, setMode] = useState<CaptureMode>(typeParam || "audio");
  const [status, setStatus] = useState<"idle" | "recording" | "ready">("idle");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{ url: string; name: string }[]>([]);
  const [activeApps, setActiveApps] = useState<{ slug: string; id: string }[]>([]);
  const [isCheckingApps, setIsCheckingApps] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showContext, setShowContext] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeParam && modes.some(m => m.id === typeParam)) {
      setMode(typeParam);
    }
    
    // Check for active apps
    const checkApps = async () => {
      setIsCheckingApps(true);
      try {
        const apps = await getComposioActiveApps();
        setActiveApps(apps);
      } catch (err) {
        console.error("Failed to check active apps:", err);
      } finally {
        setIsCheckingApps(false);
      }
    };
    checkApps();
  }, [typeParam]);

  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (status === "idle") setTimer(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
  }, [mediaUrl, imagePreviews]);

  useEffect(() => cleanup, [cleanup]);

  useEffect(() => {
    if (status === "ready" && previewVideoRef.current && mediaUrl) {
      previewVideoRef.current.src = mediaUrl;
      previewVideoRef.current.play();
    }
  }, [status, mediaUrl]);

  const startRecording = async () => {
    try {
      cleanup();
      setMediaBlob(null);
      setMediaUrl(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: mode === "video" 
      });
      streamRef.current = stream;

      if (videoRef.current && mode === "video") {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        setStatus("ready");
      };

      recorder.start();
      setStatus("recording");
    } catch (err) {
      toast.error("Media access required for capture.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setStatus("ready");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const activeMode = modes.find(m => m.id === mode)!;
      const isMediaMode = mode === "audio" || mode === "video";

      if (isMediaMode && status !== "ready") {
        throw new Error(`Record a ${activeMode.label.toLowerCase()} journal before saving.`);
      }

      if (isMediaMode && !mediaBlob) {
        throw new Error("The recording is still missing. Please record again.");
      }

      if (isMediaMode && !activeApps.some(app => app.slug === "googledrive")) {
        throw new Error("Connect Google Drive before saving audio or video journals.");
      }

      const finalTitle = title.trim() || `New ${activeMode.label} Moment`;
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-").substring(0, 5);
      const extension = getMediaExtension(mediaBlob, mode);
      const fileName = `${dateStr}_${timeStr}_${toSafeFilePart(finalTitle)}.${extension}`;

      let driveFileId = "";
      let driveWebUrl = "";
      let driveFolderId: string | undefined;
      let driveFolderPath: string | undefined;

      if (mediaBlob && (mode === "audio" || mode === "video")) {
        const formData = new FormData();
        formData.append("file", mediaBlob, fileName);
        formData.append("fileName", fileName);
        formData.append("mediaType", mode);
        formData.append("userId", ""); // Handled server-side

        const { uploadMediaToDrive } = await import("@/actions/media-journals");
        const uploadResult = await uploadMediaToDrive(formData);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }

        if (!uploadResult.driveFileId) {
          throw new Error("Google Drive upload finished without a file id.");
        }

        driveFileId = uploadResult.driveFileId;
        driveWebUrl = uploadResult.driveWebUrl || `https://drive.google.com/file/d/${driveFileId}/view`;
        driveFolderId = uploadResult.folderId;
        driveFolderPath = uploadResult.folderPath;
      }

      if (mode === "audio" || mode === "video") {
        const { saveAudioJournal, saveVideoJournal } = await import("@/actions/media-journals");
        const saveFn = mode === "video" ? saveVideoJournal : saveAudioJournal;
        const result = await saveFn({
          title: finalTitle,
          driveFileId,
          driveWebUrl,
          transcript: notes,
          duration: timer,
          folderId: driveFolderId,
          userId: undefined
        });

        if (result.success) {
          toast.success(driveFolderPath ? `Synced to ${driveFolderPath}` : "Moment captured and synced!");
          router.push(`/dashboard/journal/${mode}/${result.data}`);
        } else {
          toast.error(result.error);
        }
      } else {
        // Text/Image (legacy fallback for text)
        const content = `# ${finalTitle}\n\n[Captured ${activeMode.label}]\n\n${notes}`;
        const result = await saveJournal(content, undefined, finalTitle, undefined, ["capture", mode]);
        
        if (result.success) {
          toast.success("Moment captured successfully!");
          router.push(`/dashboard/journal/text/${result.data}`);
        } else {
          toast.error(result.error);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save capture.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeMode = modes.find(m => m.id === mode)!;
  const isMediaMode = mode === "audio" || mode === "video";
  const isDriveConnected = activeApps.some(app => app.slug === "googledrive");
  const canSave = isMediaMode
    ? status === "ready" && Boolean(mediaBlob) && isDriveConnected
    : status !== "recording" && (imagePreviews.length > 0 || notes.trim().length > 0);

  return (
    <div className={cn(
      "min-h-full transition-all duration-500",
      isFullscreen ? "bg-background p-0" : "bg-background/30 py-10 px-6"
    )}>
      <div className={cn(
        "mx-auto space-y-10 transition-all duration-500",
        isFullscreen ? "max-w-none h-screen flex flex-col" : "max-w-5xl"
      )}>
        
        {/* Header - Hidden in Fullscreen */}
        {!isFullscreen && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-heading font-semibold text-foreground tracking-tight">Capture Moment</h1>
              <p className="font-medium text-muted-foreground/60 text-sm">Document your life in high fidelity.</p>
            </div>
            <div className="flex bg-muted/20 border border-border/10 rounded-xl p-1 h-12 items-center">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setStatus("idle");
                    cleanup();
                    setImagePreviews([]);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-5 h-full rounded-lg text-xs font-semibold tracking-tight transition-all",
                    mode === m.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground/60 hover:text-foreground"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={cn(
          "flex flex-col gap-10 transition-all",
          isFullscreen ? "flex-1 relative" : ""
        )}>
          {/* Stage Area */}
          <div className={cn(
            "relative rounded-2xl border border-border/10 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden bg-black group",
            status === "recording" ? "border-red-500/50" : "border-border/10",
            isFullscreen ? "h-full border-0 rounded-0 m-0" : "aspect-video w-full"
          )}>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-6 right-6 z-50 h-10 w-10 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            {/* Video Feed */}
            {mode === "video" && (
              <div className="absolute inset-0">
                {status === "recording" || status === "idle" ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={cn(
                      "h-full w-full object-cover transition-opacity",
                      status === "idle" && "opacity-20 grayscale"
                    )}
                  />
                ) : (
                  <video
                    ref={previewVideoRef}
                    src={mediaUrl || undefined}
                    controls
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            )}

            {/* Recording Pulse Animation */}
            {status === "recording" && mode !== "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/5 animate-pulse">
                 <div className="flex items-end gap-1.5 h-24">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-primary/40 rounded-full animate-bounce" 
                        style={{ 
                          height: `${40 + Math.random() * 60}%`,
                          animationDuration: `${0.8 + Math.random()}s`
                        }} 
                      />
                    ))}
                 </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
               <div className={cn(
                 "h-2.5 w-2.5 rounded-full",
                 status === "recording" ? "bg-red-500 animate-pulse" : "bg-white/20"
               )} />
               <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                 <span className="text-[9px] font-semibold uppercase tracking-widest text-white/80">
                    {status === "recording" ? "Live Recording" : status === "ready" ? "Review Content" : "Ready"}
                 </span>
               </div>
               {status !== "idle" && (
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatTime(timer)}
                  </span>
                </div>
               )}
            </div>

            {/* Center Overlay Content (when idle or ready) */}
            {(status === "idle" || (status === "ready" && mode !== "video")) && (
              <div className="relative z-10 text-center space-y-6 px-8 max-w-sm">
                {!activeApps.some(app => app.slug === "googledrive") && !isCheckingApps && (mode === "audio" || mode === "video") ? (
                  <>
                    <div className="mx-auto h-20 w-20 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                       <HardDrive className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-white tracking-tight">Drive disconnected</p>
                      <p className="text-xs font-medium text-white/40">Connect Google Drive to save audio and video journals.</p>
                      <Button 
                        onClick={() => router.push("/dashboard/connectors")}
                        className="mt-4 h-9 px-6 rounded-lg text-xs"
                      >
                        Connect Drive
                      </Button>
                    </div>
                  </>
                ) : status === "idle" ? (
                  <>
                    <div className="mx-auto h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center text-white/80 border border-white/10 transition-transform group-hover:scale-105">
                       <activeMode.icon className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold text-white tracking-tight">Ready to Capture</p>
                      <p className="text-xs font-medium text-white/40">Start recording your {activeMode.label.toLowerCase()} journal.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
                       <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold text-white tracking-tight">Capture Complete</p>
                      <p className="text-xs font-medium text-white/40">Save it to Debo and Google Drive.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Bottom Controls Overlay */}
            <div className={cn(
              "absolute bottom-8 flex flex-col items-center gap-6 z-20 w-full",
              isFullscreen ? "bottom-16" : ""
            )}>
              <div className="flex gap-4">
                {status === "recording" ? (
                  <Button 
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="h-14 px-10 rounded-xl font-semibold tracking-tight text-sm active:scale-95 transition-all"
                  >
                    <Square className="h-4 w-4 mr-3 fill-current" /> Stop Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording}
                    disabled={isCheckingApps || (!isDriveConnected && (mode === "audio" || mode === "video"))}
                    size="lg"
                    className={cn(
                      "h-14 px-10 rounded-xl font-semibold tracking-tight text-sm active:scale-95 transition-all",
                      status === "ready" ? "bg-muted text-foreground border border-border/10" : "bg-primary text-primary-foreground",
                      (isCheckingApps || (!isDriveConnected && (mode === "audio" || mode === "video"))) && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    {status === "ready" ? "Retake Capture" : `Start ${activeMode.label}`}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Context & Metadata - Moved to Bottom */}
          <div className={cn(
            "transition-all duration-500",
            isFullscreen ? "fixed bottom-0 left-0 right-0 z-50 p-8 bg-gradient-to-t from-black/80 to-transparent pt-20" : "w-full"
          )}>
            <div className={cn(
              "minimal-card transition-all overflow-hidden border border-border/10",
              !showContext && !isFullscreen && "h-16"
            )}>
               <div 
                 onClick={() => setShowContext(!showContext)}
                 className="flex items-center justify-between px-6 h-16 cursor-pointer hover:bg-muted/10 transition-colors"
               >
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground tracking-tight">Context & Metadata</span>
                 </div>
                 <ChevronDown className={cn("h-5 w-5 text-muted-foreground/30 transition-transform", showContext && "rotate-180")} />
               </div>

               {showContext && (
                 <div className="p-6 pt-0 grid lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-5">
                       <div className="space-y-2">
                         <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-1">Moment Title</label>
                         <Input 
                           placeholder="Untitled moment..."
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="h-12 rounded-xl border border-border/20 bg-muted/10 text-base font-medium focus-visible:ring-primary/20 focus-visible:border-primary/40"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-1">Observations</label>
                         <Textarea 
                           placeholder="Describe the context, people, and feelings..."
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           className="min-h-[140px] rounded-xl border border-border/20 bg-muted/10 font-medium resize-none focus-visible:ring-primary/20 focus-visible:border-primary/40"
                         />
                       </div>
                    </div>

                    <div className="flex flex-col justify-between gap-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col gap-3">
                             <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Brain className="h-4 w-4" />
                             </div>
                             <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
                               Debo extracts action items and patterns automatically.
                             </p>
                          </div>
                          <div className="bg-muted/10 border border-border/10 rounded-2xl p-5 flex flex-col gap-3">
                             <div className="h-8 w-8 rounded-lg bg-muted/20 text-muted-foreground flex items-center justify-center">
                                <History className="h-4 w-4" />
                             </div>
                             <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed">
                               Audio and video stay organized inside Google Drive.
                             </p>
                          </div>
                       </div>

                       <Button
                         onClick={handleSave}
                         disabled={isSaving || !canSave}
                         className="w-full h-14 rounded-xl text-base font-semibold tracking-tight transition-all"
                       >
                         {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                           <>
                             <Sparkles className="h-5 w-5 mr-3" />
                             Sync to Memory
                           </>
                         )}
                       </Button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer info - hidden in fullscreen */}
        {!isFullscreen && (
          <p className="text-[10px] font-semibold text-center text-muted-foreground/20 uppercase tracking-[0.2em] pb-10">
             Google Drive sync required for audio and video journals
          </p>
        )}
      </div>
    </div>
  );
}
