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
} from "lucide-react";
import { toast } from "sonner";
import { saveJournal } from "@/actions/journals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CaptureMode = "audio" | "video" | "image";

const modes = [
  { id: "audio" as const, label: "Audio", icon: Mic2, color: "bg-duo-green", shadow: "shadow-duo-feather-shadow", accent: "text-duo-green" },
  { id: "video" as const, label: "Video", icon: VideoIcon, color: "bg-duo-macaw", shadow: "shadow-duo-macaw-shadow", accent: "text-duo-macaw" },
  { id: "image" as const, label: "Photos", icon: FileImage, color: "bg-duo-fox", shadow: "shadow-duo-fox-shadow", accent: "text-duo-fox" },
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
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeParam && modes.some(m => m.id === typeParam)) {
      setMode(typeParam);
    }
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
      toast.error("Microphone access required for capture.");
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
      
      const content = `# ${finalTitle}\n\n[Captured ${activeMode.label}]\n\n${notes}`;
      
      const result = await saveJournal(content, undefined, finalTitle, undefined, ["capture", mode]);
      
      if (result.success) {
        toast.success("Moment captured successfully!");
        router.push(`/dashboard/journal/${result.data}`);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Failed to save capture.");
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
    <div className="min-h-full bg-duo-polar">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-black text-duo-eel">Capture Moment</h1>
            <p className="font-bold text-duo-wolf">Document your life in real-time.</p>
          </div>
          <div className="flex bg-duo-snow border-2 border-duo-swan rounded-2xl p-1 shadow-[0_4px_0_var(--duo-swan)]">
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
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  mode === m.id ? `${m.color} text-white ${m.shadow} scale-105` : "text-duo-wolf hover:bg-duo-polar"
                )}
              >
                <m.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main Stage */}
          <div className="lg:col-span-3 space-y-6">
            <div className={cn(
              "relative aspect-square sm:aspect-video rounded-[2.5rem] border-4 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden bg-white shadow-[0_12px_0_var(--duo-swan)]",
              status === "recording" ? "border-duo-cardinal" : "border-duo-swan"
            )}>
              
              {/* Recording Animation / Visualizer */}
              {status === "recording" && (
                <div className="absolute inset-0 flex items-center justify-center bg-duo-cardinal/5 animate-pulse">
                   <div className="flex items-end gap-1.5 h-20">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 bg-duo-cardinal rounded-full animate-bounce" 
                          style={{ 
                            height: `${20 + Math.random() * 80}%`,
                            animationDuration: `${0.5 + Math.random()}s`
                          }} 
                        />
                      ))}
                   </div>
                </div>
              )}

              {/* Status Overlay */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                 <div className={cn(
                   "h-3 w-3 rounded-full",
                   status === "recording" ? "bg-duo-cardinal animate-ping" : "bg-duo-swan"
                 )} />
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
                    {status === "recording" ? "Live Recording" : status === "ready" ? "Capture Ready" : "Ready to start"}
                 </span>
              </div>

              {/* Timer */}
              {status !== "idle" && mode !== "image" && (
                <div className="absolute top-6 right-6 font-display text-2xl font-black text-duo-eel">
                   {formatTime(timer)}
                </div>
              )}

              {/* Center Content */}
              {status === "idle" && (
                <div className="text-center space-y-6 px-8">
                  {mode === "image" ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer group space-y-6"
                    >
                      <div className="mx-auto h-32 w-32 rounded-[2.5rem] flex items-center justify-center bg-duo-fox/10 text-duo-fox border-4 border-dashed border-duo-fox/30 group-hover:bg-duo-fox/20 transition-all">
                        <Upload className="h-12 w-12" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-duo-eel">Upload Photos</p>
                        <p className="text-sm font-bold text-duo-wolf">Diary pages, whiteboards, or moments.</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  ) : (
                    <>
                      <div className={cn("mx-auto h-24 w-24 rounded-[2rem] flex items-center justify-center text-white shadow-xl", activeMode.color)}>
                         <activeMode.icon className="h-12 w-12" />
                      </div>
                      <p className="text-sm font-black text-duo-swan uppercase tracking-widest">
                        Tap record to begin
                      </p>
                    </>
                  )}
                </div>
              )}

              {status === "ready" && (
                <div className="text-center space-y-6 w-full px-8 overflow-y-auto max-h-full py-12">
                  <div className="h-20 w-20 rounded-full bg-duo-feather/10 text-duo-feather flex items-center justify-center mx-auto">
                     <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-duo-eel">Moment Captured</p>
                    <p className="text-sm font-bold text-duo-wolf">Ready to synchronize with palace</p>
                  </div>
                  
                  {mode === "image" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                       {imagePreviews.map((p, i) => (
                         <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-duo-swan bg-duo-polar relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                         </div>
                       ))}
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="aspect-square rounded-2xl border-2 border-dashed border-duo-swan flex items-center justify-center text-duo-swan hover:bg-duo-polar transition-all"
                       >
                         <Upload className="h-6 w-6" />
                       </button>
                    </div>
                  )}

                  {mediaUrl && mode === "audio" && (
                    <div className="mx-auto w-full max-w-sm">
                       <audio src={mediaUrl} controls className="w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-10 flex gap-4">
                {status === "recording" ? (
                  <Button 
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="h-16 px-10 rounded-2xl shadow-[0_6px_0_var(--duo-cardinal-shadow)] uppercase font-black tracking-widest"
                  >
                    <Square className="h-5 w-5 mr-3 fill-current" /> Stop
                  </Button>
                ) : mode !== "image" ? (
                  <Button 
                    onClick={startRecording}
                    variant="duolingo"
                    size="lg"
                    className="h-16 px-10 rounded-2xl shadow-[0_6px_0_var(--duo-feather-shadow)] uppercase font-black tracking-widest"
                  >
                    {status === "ready" ? "Retake" : `Record ${activeMode.label}`}
                  </Button>
                ) : status === "ready" && (
                  <Button 
                    onClick={() => { setStatus("idle"); setImagePreviews([]); }}
                    variant="destructive"
                    size="lg"
                    className="h-16 px-10 rounded-2xl shadow-[0_6px_0_var(--duo-cardinal-shadow)] uppercase font-black tracking-widest"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-duo-macaw/5 border-2 border-duo-macaw/20 rounded-3xl p-6 flex gap-4">
                  <Brain className="h-6 w-6 text-duo-macaw shrink-0" />
                  <p className="text-xs font-bold text-duo-macaw leading-relaxed">
                    Debo automatically extracts memories from your capture.
                  </p>
               </div>
               <div className="bg-duo-fox/5 border-2 border-duo-fox/20 rounded-3xl p-6 flex gap-4">
                  <History className="h-6 w-6 text-duo-fox shrink-0" />
                  <p className="text-xs font-bold text-duo-fox leading-relaxed">
                    Captured moments are indexed by date and location.
                  </p>
               </div>
            </div>
          </div>

          {/* Context Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-4 border-duo-swan rounded-[2.5rem] p-8 shadow-[0_12px_0_var(--duo-swan)] space-y-6">
               <div className="space-y-2">
                 <h2 className="text-xl font-black text-duo-eel uppercase tracking-tight">Context</h2>
                 <p className="text-sm font-bold text-duo-wolf">Add metadata to help Debo connect the dots.</p>
               </div>

               <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-duo-swan px-1">Title</label>
                    <Input 
                      placeholder="e.g. Afternoon Walk with Maya"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 rounded-xl border-2 border-duo-swan bg-duo-polar font-bold focus-visible:ring-duo-macaw/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-duo-swan px-1">Notes / Transcript</label>
                    <Textarea 
                      placeholder="What happened? Who were you with? What did you promise?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[200px] rounded-xl border-2 border-duo-swan bg-duo-polar font-bold resize-none focus-visible:ring-duo-macaw/20"
                    />
                  </div>
               </div>

               <Button
                 onClick={handleSave}
                 disabled={isSaving || status === "recording" || (status === "idle" && !notes.trim())}
                 className="w-full h-16 rounded-2xl bg-duo-macaw hover:bg-duo-macaw/90 text-white font-black uppercase tracking-widest shadow-[0_6px_0_var(--duo-macaw-shadow)] transition-all active:translate-y-1 active:shadow-none"
               >
                 {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 mr-3" />}
                 Sync to Palace
               </Button>
            </div>

            <p className="text-[10px] font-black text-center text-duo-swan uppercase tracking-[0.2em] px-8">
               Your moment is encrypted and private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
