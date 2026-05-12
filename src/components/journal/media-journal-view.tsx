"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic2, Video, HardDrive, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaKind = "audio" | "video";

export function MediaJournalView({
    id,
    type,
    title,
    transcript,
    driveWebUrl,
    createdAt,
}: {
    id: string;
    type: MediaKind;
    title: string;
    transcript?: string;
    driveWebUrl?: string;
    createdAt: Date;
}) {
    const router = useRouter();

    return (
        <div className="w-full flex flex-col min-h-screen bg-background">
            {/* Header */}
            <div className="max-w-screen-xl mx-auto w-full px-6 py-8 flex items-center justify-between">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/dashboard/journals")}
                    className="rounded-xl h-10 w-10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-4">
                    <div className="bg-card border border-border px-4 py-1.5 rounded-full flex items-center gap-2">
                         <div className={cn(
                             "h-2 w-2 rounded-full",
                             type === "audio" ? "bg-primary" : "bg-primary/60"
                         )} />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                             {type} Entry
                         </span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto w-full px-6 flex-1 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-12">
                    {/* Title and Date */}
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight text-foreground">
                            {title || `Untitled ${type} moment`}
                        </h1>
                        <p className="font-medium text-muted-foreground">
                            Captured on {new Date(createdAt).toLocaleDateString(undefined, { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>

                    {/* Media Player Card */}
                    <div className="relative rounded-3xl border border-border/50 bg-black/95 overflow-hidden shadow-sm group aspect-video flex items-center justify-center">
                        {type === "video" ? (
                            driveWebUrl ? (
                                <iframe 
                                    src={driveWebUrl.replace('/view', '/preview')} 
                                    className="w-full h-full border-none"
                                    allow="autoplay"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-white/20">
                                    <Video className="h-16 w-16" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Media is processing</p>
                                </div>
                            )
                        ) : (
                            <div className="w-full h-full bg-primary/5 flex flex-col items-center justify-center gap-8">
                                <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                    <Mic2 className="h-10 w-10" />
                                </div>
                                {driveWebUrl ? (
                                    <audio 
                                        src={driveWebUrl} 
                                        controls 
                                        className="w-full max-w-md accent-primary"
                                    />
                                ) : (
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Audio is processing</p>
                                )}
                            </div>
                        )}

                        {/* Drive Link Overlay */}
                        {driveWebUrl && (
                            <a 
                                href={driveWebUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <HardDrive className="h-5 w-5" />
                            </a>
                        )}
                    </div>

                    {/* Transcript / Context Section */}
                    <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-10 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground tracking-tight">Contextual Insights</h2>
                        </div>
                        
                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                            {transcript ? (
                                <p className="text-lg font-medium text-foreground/80 leading-relaxed italic">
                                    &ldquo;{transcript}&rdquo;
                                </p>
                            ) : (
                                <p className="text-lg font-medium text-muted-foreground/50 italic">
                                    No transcription available for this capture.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
