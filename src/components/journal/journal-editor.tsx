"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { saveJournal } from "@/actions/journals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, FileImage, Loader2, Mic2, Play, Video, Check } from "lucide-react";
import dynamic from "next/dynamic";

const BlockEditor = dynamic(() => import("./block-editor"), { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-muted/20 animate-pulse rounded-2xl" />
});

type CaptureMediaItem = {
    kind: "audio" | "video" | "image";
    label: string;
    size: string;
    src: string;
};

export function JournalEditor({ 
    initialContent = "", 
    initialId = "", 
    initialTitle = "",
    initialTags = []
}: { 
    initialContent?: string, 
    initialId?: string, 
    initialTitle?: string,
    initialTags?: string[]
}) {
    const [content, setContent] = useState(initialContent);
    const [title, setTitle] = useState(initialTitle);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [tagInput, setTagInput] = useState("");
    const [id, setId] = useState(initialId);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const router = useRouter();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mediaItems = useMemo(() => extractCaptureMedia(content), [content]);

    const handleSave = useCallback(async (currentContent: string, currentId: string, currentTitle: string, currentTags: string[]) => {
        if (!currentContent.trim() && !currentTitle.trim()) return currentId;
        
        setSaveStatus("saving");
        try {
            const result = await saveJournal(currentContent, currentId || undefined, currentTitle || undefined, undefined, currentTags);
            
            if (result.success && result.data) {
                const newId = result.data;
                if (!currentId) {
                    setId(newId);
                    window.history.replaceState(null, "", `/dashboard/journal/${newId}`);
                }
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
                return newId;
            } else {
                toast.error(result.error || "Sync failed.");
                setSaveStatus("idle");
            }
        } catch {
            setSaveStatus("idle");
        }
        return currentId;
    }, []);

    useEffect(() => {
        if (content === initialContent && title === initialTitle && JSON.stringify(tags) === JSON.stringify(initialTags) && id) return;
        if (!content.trim() && !title.trim() && !id) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            handleSave(content, id, title, tags);
        }, 1500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [content, id, title, tags, handleSave, initialContent, initialTitle, initialTags]);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/^#/, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="w-full flex flex-col min-h-screen bg-background">
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
                    {saveStatus === "saving" && (
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-duo-macaw animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Syncing...</span>
                        </div>
                    )}
                    {saveStatus === "saved" && (
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-duo-green animate-in fade-in zoom-in duration-300">
                            <Check className="h-4 w-4" />
                            <span>Saved</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-4xl mx-auto w-full px-6 flex-1 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-6">
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-5xl font-heading font-black tracking-tight bg-transparent border-none outline-none placeholder:text-duo-swan text-duo-eel px-0"
                    />

                    {/* Tags UI */}
                    <div className="flex flex-wrap items-center gap-2">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold tracking-wider uppercase border border-primary/20">
                                #{tag}
                                <button onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5 ml-1 transition-colors text-primary/70 hover:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder={tags.length === 0 ? "Add tags (e.g. #work, #health)..." : "Add tag..."}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="bg-transparent border-none outline-none text-sm text-duo-wolf font-bold placeholder:text-duo-swan min-w-[120px]"
                        />
                    </div>

                    {mediaItems.length > 0 ? (
                        <CaptureMediaPreview items={mediaItems} />
                    ) : null}
                    
                    <div className="min-h-[60vh] duo-editor-container pt-6 border-t border-duo-swan">
                        <BlockEditor 
                            initialContent={content} 
                            onChange={(markdown) => setContent(markdown)} 
                        />
                    </div>
                </div>
            </main>
        </div>
    );

}

function CaptureMediaPreview({ items }: { items: CaptureMediaItem[] }) {
    return (
        <section className="rounded-3xl border border-duo-swan bg-duo-snow p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-duo-green">
                        Capture media
                    </p>
                    <h2 className="text-xl font-heading font-black text-duo-eel">
                        Saved recording
                    </h2>
                </div>
                <span className="rounded-full bg-duo-polar px-3 py-1 text-[10px] font-black uppercase tracking-wider text-duo-wolf">
                    {items.length} file{items.length === 1 ? "" : "s"}
                </span>
            </div>

            <div className="grid gap-3">
                {items.map((item) => (
                    <article key={`${item.kind}-${item.src}`} className="overflow-hidden rounded-2xl border border-duo-swan bg-background">
                        {item.kind === "video" ? (
                            <video
                                src={item.src}
                                controls
                                playsInline
                                preload="metadata"
                                className="aspect-video w-full bg-black object-contain"
                            />
                        ) : item.kind === "audio" ? (
                            <div className="p-4">
                                <audio src={item.src} controls preload="metadata" className="w-full" />
                            </div>
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.src} alt={item.label} className="max-h-[520px] w-full object-contain" />
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-duo-swan px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-duo-polar text-duo-green">
                                    {item.kind === "video" ? (
                                        <Video className="h-4 w-4" />
                                    ) : item.kind === "audio" ? (
                                        <Mic2 className="h-4 w-4" />
                                    ) : (
                                        <FileImage className="h-4 w-4" />
                                    )}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-duo-eel">{item.label}</p>
                                    <p className="text-xs font-bold text-duo-wolf">{item.size}</p>
                                </div>
                            </div>
                            <a
                                href={item.src}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-duo-swan px-3 py-2 text-xs font-black uppercase tracking-wider text-duo-wolf transition hover:bg-duo-polar hover:text-duo-eel"
                            >
                                {item.kind === "video" ? <Play className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                                Open
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function extractCaptureMedia(content: string): CaptureMediaItem[] {
    return content
        .split("\n")
        .map((line) => line.trim())
        .map((line) => {
            const match = line.match(/^-\s*(audio|video|image):\s*(.+?)\s+\(([^)]+)\)\s+(\S+)/i);
            if (!match) return null;

            const [, kind, label, size, rawSrc] = match;
            return {
                kind: kind.toLowerCase() as CaptureMediaItem["kind"],
                label,
                size,
                src: mediaSrcFromStoredValue(rawSrc),
            };
        })
        .filter((item): item is CaptureMediaItem => Boolean(item));
}

function mediaSrcFromStoredValue(value: string) {
    if (value.startsWith("r2://")) {
        const key = value.slice("r2://".length);
        return `/api/capture/media/${key.split("/").map(encodeURIComponent).join("/")}`;
    }

    return value;
}
