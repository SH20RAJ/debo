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
  { id: "audio" as const, label: "Audio", icon: Mic2, color: "bg-duo-macaw", shadow: "shadow-duo-macaw-shadow", accent: "text-duo-macaw" }, // Blue
  { id: "video" as const, label: "Video", icon: VideoIcon, color: "bg-duo-feather", shadow: "shadow-duo-feather-shadow", accent: "text-duo-feather" }, // Green
  { id: "image" as const, label: "Photos", icon: FileImage, color: "bg-duo-fox", shadow: "shadow-duo-fox-shadow", accent: "text-duo-fox" }, // Orange
];

export function CaptureStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as CaptureMode | null;

  const [mode, setMode] = useState<CaptureMode>(typeParam || "audio");
  const [status, setStatus] = useState<"idle" | "recording" | "ready">("idle");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{ url: string; name: string }[]>([]);
  const [activeApps, setActiveApps] = useState<string[]>([]);
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
      const finalTitle = title.trim() || `New ${activeMode.label} Moment`;
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-").substring(0, 5);
      const extension = mode === "video" ? "mp4" : mode === "audio" ? "webm" : "jpg";
      const fileName = `${dateStr}_${timeStr}_${finalTitle.replace(/\s+/g, "-")}.${extension}`;

      let driveFileId = "";
      let driveWebUrl = "";

      if (mediaBlob && (mode === "audio" || mode === "video")) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(mediaBlob);
        });
        const base64Content = await base64Promise;

        const { uploadMediaToDrive } = await import("@/actions/media-journals");
        const uploadResult = await uploadMediaToDrive({
          userId: "", // Will be resolved server-side
          fileContent: base64Content,
          fileName,
          mimeType: mediaBlob.type
        });

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }

        driveFileId = uploadResult.driveFileId!;
        driveWebUrl = uploadResult.driveWebUrl!;
      }

      if (mode === "audio" || mode === "video") {
        const { saveAudioJournal, saveVideoJournal } = await import("@/actions/media-journals");
        const saveFn = mode === "video" ? saveVideoJournal : saveAudioJournal;
        const result = await saveFn({
          title: finalTitle,
          driveFileId,
          driveWebUrl,
          transcript: notes,
          userId: undefined
        });

        if (result.success) {
          toast.success("Moment captured and synced!");
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

  return (
    <div className={cn(
      "min-h-full transition-all duration-500",
      isFullscreen ? "bg-[#091416] p-0" : "bg-duo-polar py-8 px-4"
    )}>
      <div className={cn(
        "mx-auto space-y-8 transition-all duration-500",
        isFullscreen ? "max-w-none h-screen flex flex-col" : "max-w-6xl"
      )}>
        
        {/* Header - Hidden in Fullscreen */}
        {!isFullscreen && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-heading font-black text-duo-eel lowercase">capture moment</h1>
              <p className="font-bold text-duo-wolf">document your life in real-time.</p>
            </div>
            <div className="flex bg-duo-snow border-2 border-duo-swan rounded-2xl p-1 shadow-[0_4px_0_var(--duo-swan)] h-14 items-center">
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
                    "flex items-center gap-2 px-6 h-full rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                    mode === m.id ? `${m.color} text-white ${m.shadow} scale-105` : "text-duo-wolf hover:bg-duo-polar"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={cn(
          "flex flex-col gap-8 transition-all",
          isFullscreen ? "flex-1 relative" : ""
        )}>
          {/* Stage Area */}
          <div className={cn(
            "relative rounded-[2.5rem] border-4 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden bg-black shadow-[0_12px_0_var(--duo-swan)] group",
            status === "recording" ? "border-duo-cardinal" : "border-duo-swan",
            isFullscreen ? "h-full border-0 rounded-0 shadow-none m-0" : "aspect-video w-full"
          )}>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-6 right-6 z-50 h-12 w-12 rounded-2xl bg-black/40 backdrop-blur-md text-white border-2 border-white/20 flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
            >
              {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
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
              <div className="absolute inset-0 flex items-center justify-center bg-duo-macaw/5 animate-pulse">
                 <div className="flex items-end gap-2 h-32">
                    {[...Array(16)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-duo-macaw rounded-full animate-bounce" 
                        style={{ 
                          height: `${30 + Math.random() * 70}%`,
                          animationDuration: `${0.6 + Math.random()}s`
                        }} 
                      />
                    ))}
                 </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
               <div className={cn(
                 "h-4 w-4 rounded-full",
                 status === "recording" ? "bg-duo-cardinal animate-ping" : "bg-duo-swan/50"
               )} />
               <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    {status === "recording" ? "LIVE" : status === "ready" ? "CAPTURE READY" : "IDLE"}
                 </span>
               </div>
               {status !== "idle" && (
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                  <span className="text-lg font-black text-white font-display">
                    {formatTime(timer)}
                  </span>
                </div>
               )}
            </div>

            {/* Center Overlay Content (when idle or ready) */}
            {(status === "idle" || (status === "ready" && mode !== "video")) && (
              <div className="relative z-10 text-center space-y-8 px-8 max-w-lg">
                {!activeApps.includes("googledrive") && !isCheckingApps && (mode === "audio" || mode === "video") ? (
                  <>
                    <div className="mx-auto h-32 w-32 rounded-[2.5rem] bg-duo-orange/10 text-duo-orange flex items-center justify-center border-4 border-duo-orange shadow-2xl">
                       <HardDrive className="h-16 w-16" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-2xl font-black text-white drop-shadow-lg lowercase">drive not connected</p>
                      <p className="text-sm font-bold text-white/60">Connect your Google Drive to save audio and video captures.</p>
                      <Button 
                        onClick={() => router.push("/dashboard/connectors")}
                        variant="duolingo"
                        className="bg-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)]"
                      >
                        Connect Now
                      </Button>
                    </div>
                  </>
                ) : status === "idle" ? (
                  <>
                    <div className={cn(
                      "mx-auto h-32 w-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110",
                      activeMode.color
                    )}>
                       <activeMode.icon className="h-16 w-16" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-white drop-shadow-lg lowercase">ready to capture?</p>
                      <p className="text-sm font-bold text-white/60">tap record below to start your {activeMode.label} journal.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-24 w-24 rounded-[2rem] bg-duo-feather/20 text-duo-feather border-4 border-duo-feather flex items-center justify-center mx-auto">
                       <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-white drop-shadow-lg lowercase">captured!</p>
                      <p className="text-sm font-bold text-white/60">review and sync your moment below.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Bottom Controls Overlay */}
            <div className={cn(
              "absolute bottom-10 flex flex-col items-center gap-6 z-20 w-full",
              isFullscreen ? "bottom-20" : ""
            )}>
              <div className="flex gap-4">
                {status === "recording" ? (
                  <Button 
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="h-20 px-12 rounded-[2rem] shadow-[0_8px_0_var(--duo-cardinal-shadow)] uppercase font-black tracking-widest text-lg active:translate-y-2 active:shadow-none transition-all"
                  >
                    <Square className="h-6 w-6 mr-4 fill-current" /> Stop
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording}
                    disabled={!activeApps.includes("googledrive") && (mode === "audio" || mode === "video")}
                    variant="duolingo"
                    size="lg"
                    className={cn(
                      "h-20 px-12 rounded-[2rem] uppercase font-black tracking-widest text-lg active:translate-y-2 active:shadow-none transition-all",
                      status === "ready" ? "bg-duo-wolf shadow-[0_8px_0_var(--duo-eel)]" : `bg-duo-feather shadow-[0_8px_0_var(--duo-feather-shadow)]`,
                      (!activeApps.includes("googledrive") && (mode === "audio" || mode === "video")) && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    {status === "ready" ? "Retake" : `Start ${activeMode.label}`}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Context & Metadata - Moved to Bottom */}
          <div className={cn(
            "transition-all duration-500",
            isFullscreen ? "fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black/80 to-transparent pt-20" : "w-full"
          )}>
            <div className={cn(
              "bg-white border-4 border-duo-swan rounded-[2.5rem] shadow-[0_12px_0_var(--duo-swan)] transition-all overflow-hidden",
              !showContext && !isFullscreen && "h-20"
            )}>
               <div 
                 onClick={() => setShowContext(!showContext)}
                 className="flex items-center justify-between px-8 h-20 cursor-pointer hover:bg-duo-polar transition-colors"
               >
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-duo-macaw/10 text-duo-macaw flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-black text-duo-eel uppercase tracking-tight">Context & Insights</span>
                 </div>
                 <ChevronDown className={cn("h-6 w-6 text-duo-swan transition-transform", showContext && "rotate-180")} />
               </div>

               {showContext && (
                 <div className="p-8 pt-0 grid lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-6">
                       <div className="space-y-3">
                         <label className="text-xs font-black uppercase tracking-widest text-duo-swan px-1">Moment Title</label>
                         <Input 
                           placeholder="What are we calling this moment?"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="h-16 rounded-2xl border-2 border-duo-swan bg-duo-polar text-lg font-bold focus-visible:ring-duo-macaw/20 focus-visible:border-duo-macaw"
                         />
                       </div>
                       <div className="space-y-3">
                         <label className="text-xs font-black uppercase tracking-widest text-duo-swan px-1">Notes / Transcript / Observations</label>
                         <Textarea 
                           placeholder="Describe the context, people, and feelings..."
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           className="min-h-[160px] rounded-2xl border-2 border-duo-swan bg-duo-polar font-bold resize-none focus-visible:ring-duo-macaw/20 focus-visible:border-duo-macaw"
                         />
                       </div>
                    </div>

                    <div className="flex flex-col justify-between gap-8">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-duo-macaw/5 border-2 border-duo-macaw/20 rounded-3xl p-6 flex flex-col gap-4">
                             <div className="h-10 w-10 rounded-xl bg-duo-macaw/10 text-duo-macaw flex items-center justify-center">
                                <Brain className="h-5 w-5" />
                             </div>
                             <p className="text-xs font-bold text-duo-macaw leading-relaxed">
                               Debo will extract action items and memory facts from this capture.
                             </p>
                          </div>
                          <div className="bg-duo-fox/5 border-2 border-duo-fox/20 rounded-3xl p-6 flex flex-col gap-4">
                             <div className="h-10 w-10 rounded-xl bg-duo-fox/10 text-duo-fox flex items-center justify-center">
                                <History className="h-5 w-5" />
                             </div>
                             <p className="text-xs font-bold text-duo-fox leading-relaxed">
                               Captured moments are private and encrypted in your palace.
                             </p>
                          </div>
                       </div>

                       <Button
                         onClick={handleSave}
                         disabled={isSaving || status === "recording" || (status === "idle" && !notes.trim())}
                         className="w-full h-20 rounded-[2rem] bg-duo-macaw hover:bg-duo-macaw/90 text-white text-xl font-black uppercase tracking-widest shadow-[0_8px_0_var(--duo-macaw-shadow)] transition-all active:translate-y-2 active:shadow-none"
                       >
                         {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                           <>
                             <Sparkles className="h-6 w-6 mr-4" />
                             Sync to Memory Palace
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
          <p className="text-[10px] font-black text-center text-duo-swan uppercase tracking-[0.3em] pb-8">
             Your personal data is encrypted and never sold.
          </p>
        )}
      </div>
    </div>
  );
}
