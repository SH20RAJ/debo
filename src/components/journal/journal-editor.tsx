"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveJournal } from "@/actions/journals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RelatedJournals } from "@/components/dashboard/journal/related-journals";
import { ArrowLeft, Loader2, Check, ChevronLeft, ChevronRight, Plus, Video, Mic2, Image as ImageIcon, X } from "lucide-react";
import { MediaBlock, extractMediaFromContent, mediaSrcFromR2, type MediaKind } from "./media-block";
import { cn } from "@/lib/utils";
import { PlateEditor } from "@/components/editor/plate-editor";

type CaptureMediaItem = {
    id: string;
    kind: MediaKind;
    label: string;
    size: string;
    src: string;
    lineIndex: number;
    line: string;
};

export function JournalEditor({
    initialContent = "",
    initialId = "",
    initialTitle = "",
    initialTags = [],
    relatedJournals = []
}: {
    initialContent?: string,
    initialId?: string,
    initialTitle?: string,
    initialTags?: string[],
    relatedJournals?: any[]
}) {
    const contentRef = useRef(initialContent);
    const [title, setTitle] = useState(initialTitle);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [tagInput, setTagInput] = useState("");
    const [id, setId] = useState(initialId);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [mediaItems, setMediaItems] = useState<CaptureMediaItem[]>([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showAddMedia, setShowAddMedia] = useState(false);
    const [newMediaUrl, setNewMediaUrl] = useState("");
    const [newMediaLabel, setNewMediaLabel] = useState("");
    const [newMediaKind, setNewMediaKind] = useState<MediaKind>("video");
    const router = useRouter();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Parse media from content and extract to separate state
    const parseAndExtractMedia = useCallback((text: string) => {
        const extracted = extractMediaFromContent(text);
        const items: CaptureMediaItem[] = extracted.map((media, idx) => ({
            // Use a more stable ID based on index and src/label to avoid Date.now() re-renders
            id: `media-${idx}-${media.kind}-${media.src.substring(0, 10)}`,
            kind: media.kind,
            label: media.label,
            size: media.size,
            src: mediaSrcFromR2(media.src),
            lineIndex: -1,
            line: media.fullLine,
        }));
        return items;
    }, []);

    // Initialize media from content
    useEffect(() => {
        const items = parseAndExtractMedia(initialContent);
        setMediaItems(items);
    }, [initialContent, parseAndExtractMedia]);

    // Handle content changes - use ref to avoid re-rendering PlateEditor
    const handleContentChange = useCallback((newContent: string) => {
        contentRef.current = newContent;
        
        // Re-parse to detect any changes in media lines
        const items = parseAndExtractMedia(newContent);
        
        // Only update state if items actually changed to avoid unnecessary re-renders
        setMediaItems(prev => {
            if (prev.length !== items.length) return items;
            const hasChanged = items.some((item, i) => 
                item.kind !== prev[i].kind || 
                item.src !== prev[i].src || 
                item.label !== prev[i].label
            );
            return hasChanged ? items : prev;
        });

        // Trigger auto-save via a lightweight mechanism
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            handleSaveRef.current();
        }, 2000);
    }, [parseAndExtractMedia]);

    // Remove media item (removes from content and preview)
    const handleRemoveMedia = useCallback((mediaId: string) => {
        const media = mediaItems.find(m => m.id === mediaId);
        if (!media) return;

        // Remove the line from content
        const newContent = contentRef.current
            .split("\n")
            .filter(line => line !== media.line && line.trim() !== media.line.trim())
            .join("\n");

        contentRef.current = newContent;
        setMediaItems(prev => prev.filter(m => m.id !== mediaId));

        if (currentMediaIndex >= mediaItems.length - 1 && currentMediaIndex > 0) {
            setCurrentMediaIndex(prev => prev - 1);
        }
    }, [mediaItems, currentMediaIndex]);

    // Add media via URL (MCP or manual)
    const handleAddMedia = useCallback((kind: MediaKind, src: string, label?: string) => {
        const extension = src.match(/\.(webm|mp4|mp3|wav|ogg)$/i)?.[1] || "media";
        const fileLabel = label || `${kind}-${Date.now()}.${extension}`;
        const line = `- ${kind}: ${fileLabel} (Unknown size) ${src}`;

        const newContent = contentRef.current ? `${contentRef.current}\n\n${line}` : line;
        contentRef.current = newContent;

        toast.success(`${kind} added to journal`);
    }, []);

    const handleSave = useCallback(async (currentContent: string, currentId: string, currentTitle: string, currentTags: string[]) => {
        if (!currentContent.trim() && !currentTitle.trim()) return currentId;

        setSaveStatus("saving");
        try {
            const result = await saveJournal(currentContent, currentId || undefined, currentTitle || undefined, undefined, currentTags);

            if (result.success && result.data) {
                const newId = result.data;
                if (!currentId) {
                    setId(newId);
                    window.history.replaceState(null, "", `/dashboard/journal/text/${newId}`);
                }
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
                return newId;
            } else {
                setSaveStatus("idle");
                return currentId;
            }
        } catch {
            setSaveStatus("idle");
            return currentId;
        }
    }, []);

    // Stable ref to auto-save so the content onChange callback doesn't need state deps
    const handleSaveRef = useRef(() => {
        handleSave(contentRef.current, id, title, tags);
    });
    useEffect(() => {
        handleSaveRef.current = () => {
            handleSave(contentRef.current, id, title, tags);
        };
    }, [id, title, tags, handleSave]);

    // Auto-save on title/tag changes (content auto-save is handled in handleContentChange)
    useEffect(() => {
        if (title === initialTitle && JSON.stringify(tags) === JSON.stringify(initialTags) && id) return;
        if (!contentRef.current.trim() && !title.trim() && !id) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            handleSaveRef.current();
        }, 2000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [id, title, tags, initialTitle, initialTags]);

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

    // Add media from URL
    const handleAddMediaFromUrl = useCallback(() => {
        if (!newMediaUrl.trim()) {
            toast.error("Please enter a media URL");
            return;
        }

        const url = newMediaUrl.trim();
        const label = newMediaLabel.trim() || `${newMediaKind}-${Date.now()}`;
        const size = "Added via URL";

        const line = `- ${newMediaKind}: ${label} (${size}) ${url}`;
        const newContent = contentRef.current ? `${contentRef.current}\n\n${line}` : line;

        contentRef.current = newContent;
        setNewMediaUrl("");
        setNewMediaLabel("");
        setShowAddMedia(false);
        toast.success(`${newMediaKind} added to journal`);
    }, [newMediaUrl, newMediaLabel, newMediaKind]);

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const hasMedia = mediaItems.length > 0;
    const currentMedia = mediaItems[currentMediaIndex] || null;

    return (
        <div className="w-full flex flex-col min-h-screen bg-background">
            {/* Header */}
            <div className="max-w-screen-xl mx-auto w-full px-6 py-10 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/journals")}
                    className="rounded-full h-10 w-10 border border-border/50 hover:bg-muted/40 transition-all"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground/70" />
                </Button>

                <div className="flex items-center gap-4">
                    {saveStatus === "saving" && (
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary/60 animate-pulse">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Syncing...</span>
                        </div>
                    )}
                    {saveStatus === "saved" && (
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-green-500/60 animate-in fade-in zoom-in duration-300">
                            <Check className="h-3.5 w-3.5" />
                            <span>Saved</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-4xl mx-auto w-full px-6 flex-1 pb-40">
                <div className="space-y-8">
                    <input
                        type="text"
                        placeholder="Untitled Memory"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl md:text-5xl font-heading font-semibold tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/20 text-foreground px-0"
                    />

                    {/* Tags UI */}
                    <div className="flex flex-wrap items-center gap-2">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 text-primary/80 px-2 py-1 text-xs font-medium border border-primary/10">
                                #{tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-primary transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder={tags.length === 0 ? "Add tags..." : ""}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="bg-transparent border-none outline-none text-sm text-muted-foreground/60 font-medium placeholder:text-muted-foreground/20 min-w-[120px]"
                        />
                    </div>

                    {/* Media Preview - Only show above editor, not inline */}
                    {hasMedia && currentMedia && (
                        <div className="pt-4">
                            <MediaBlock
                                key={currentMedia.id}
                                kind={currentMedia.kind}
                                label={currentMedia.label}
                                size={currentMedia.size}
                                src={currentMedia.src}
                                codeLine={currentMedia.line}
                                onRemove={() => handleRemoveMedia(currentMedia.id)}
                            />
                        </div>
                    )}

                    {/* Media Navigation and Add Button */}
                    {hasMedia && mediaItems.length > 1 && (
                        <div className="flex items-center justify-center gap-4 py-2 bg-muted/20 rounded-lg">
                            <button
                                onClick={() => setCurrentMediaIndex((i) => (i === 0 ? mediaItems.length - 1 : i - 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/60 transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                {currentMediaIndex + 1} / {mediaItems.length}
                            </span>
                            <button
                                onClick={() => setCurrentMediaIndex((i) => (i === mediaItems.length - 1 ? 0 : i + 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted/60 transition"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Add Media Button and Dialog */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddMedia(!showAddMedia)}
                            className="inline-flex items-center gap-2 rounded-md border border-dashed border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground/60 hover:bg-muted/20 hover:text-foreground transition-all"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Attach Media
                        </button>
                    </div>

                    {/* Add Media Dialog */}
                    {showAddMedia && (
                        <div className="minimal-card p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-foreground">Attach Media from URL</h3>
                                <button onClick={() => setShowAddMedia(false)} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Media Type Selection */}
                            <div className="flex gap-2">
                                {(["video", "audio", "image"] as MediaKind[]).map(kind => (
                                    <button
                                        key={kind}
                                        onClick={() => setNewMediaKind(kind)}
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all",
                                            newMediaKind === kind
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "bg-muted/30 text-muted-foreground border border-border/40 hover:bg-muted/50"
                                        )}
                                    >
                                        {kind === "video" ? <Video className="h-3.5 w-3.5" /> : kind === "audio" ? <Mic2 className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                                        {kind}
                                    </button>
                                ))}
                            </div>

                            {/* URL Input */}
                            <input
                                type="url"
                                value={newMediaUrl}
                                onChange={(e) => setNewMediaUrl(e.target.value)}
                                placeholder="Paste media URL (r2:// or https://)"
                                className="w-full rounded-md border border-border/60 bg-background px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/40 transition-colors"
                            />

                            {/* Label Input */}
                            <input
                                type="text"
                                value={newMediaLabel}
                                onChange={(e) => setNewMediaLabel(e.target.value)}
                                placeholder="Optional label"
                                className="w-full rounded-md border border-border/60 bg-background px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-primary/40 transition-colors"
                            />

                            {/* Add Button */}
                            <Button onClick={handleAddMediaFromUrl} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-5 font-semibold tracking-tight">
                                Attach to Memory
                            </Button>
                        </div>
                    )}

                    {/* Plate.js Editor (replaced Novel) */}
                    <div className="min-h-[60vh] pt-10 border-t border-border/10">
                        <PlateEditor
                            initialValue={initialContent}
                            onChange={handleContentChange}
                            placeholder="Start writing..."
                            variant="fullWidth"
                        />
                    </div>

                    {/* Editor hint */}
                    <p className="text-[10px] font-medium text-muted-foreground/20 text-center uppercase tracking-widest">
                        Media lines are extracted automatically.
                    </p>

                    {relatedJournals && relatedJournals.length > 0 && (
                        <div className="pt-20">
                            <RelatedJournals journals={relatedJournals} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}