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
        <div className="w-full flex flex-col min-h-screen bg-duo-polar">
            {/* Header */}
            <div className="max-w-screen-xl mx-auto w-full px-6 py-10 flex items-center justify-between">
                <Button
                    variant="duolingo-outline"
                    size="icon"
                    onClick={() => router.push("/dashboard/journals")}
                    className="rounded-2xl hover-bounce h-12 w-12"
                >
                    <ArrowLeft className="h-6 w-6 text-duo-eel" />
                </Button>

                <div className="flex items-center gap-4">
                    <div className="bg-white border-2 border-duo-swan px-4 py-2 rounded-xl flex items-center gap-2">
                         <div className={cn(
                             "h-3 w-3 rounded-full",
                             type === "audio" ? "bg-duo-macaw" : "bg-duo-feather"
                         )} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-duo-eel">
                             {type} Journal
                         </span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto w-full px-6 flex-1 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-12">
                    {/* Title and Date */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-heading font-black tracking-tight text-duo-eel lowercase">
                            {title || `untitled ${type} moment`}
                        </h1>
                        <p className="font-bold text-duo-wolf">
                            captured on {new Date(createdAt).toLocaleDateString(undefined, { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>

                    {/* Media Player Card */}
                    <div className="relative rounded-[2.5rem] border-4 border-duo-swan bg-black overflow-hidden shadow-[0_12px_0_var(--duo-swan)] group aspect-video flex items-center justify-center">
                        {type === "video" ? (
                            driveWebUrl ? (
                                <iframe 
                                    src={driveWebUrl.replace('/view', '/preview')} 
                                    className="w-full h-full border-none"
                                    allow="autoplay"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-white/40">
                                    <Video className="h-20 w-20" />
                                    <p className="font-black uppercase tracking-widest">Video processing or unavailable</p>
                                </div>
                            )
                        ) : (
                            <div className="w-full h-full bg-duo-macaw/5 flex flex-col items-center justify-center gap-8">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-duo-macaw flex items-center justify-center text-white shadow-2xl">
                                    <Mic2 className="h-16 w-16" />
                                </div>
                                {driveWebUrl ? (
                                    <audio 
                                        src={driveWebUrl} 
                                        controls 
                                        className="w-full max-w-md"
                                    />
                                ) : (
                                    <p className="font-black uppercase tracking-widest text-duo-macaw/40">Audio processing or unavailable</p>
                                )}
                            </div>
                        )}

                        {/* Drive Link Overlay */}
                        {driveWebUrl && (
                            <a 
                                href={driveWebUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute top-6 right-6 z-20 h-12 w-12 rounded-2xl bg-black/40 backdrop-blur-md text-white border-2 border-white/20 flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <HardDrive className="h-6 w-6" />
                            </a>
                        )}
                    </div>

                    {/* Transcript / Context Section */}
                    <div className="bg-white border-4 border-duo-swan rounded-[2.5rem] p-10 shadow-[0_8px_0_var(--duo-swan)] space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-duo-macaw/10 text-duo-macaw flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-black text-duo-eel uppercase tracking-tight">Context & Transcription</h2>
                        </div>
                        
                        <div className="prose prose-duo max-w-none">
                            {transcript ? (
                                <p className="text-lg font-bold text-duo-eel leading-relaxed italic">
                                    "{transcript}"
                                </p>
                            ) : (
                                <p className="text-lg font-bold text-duo-wolf italic">
                                    No transcript or notes provided for this moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
