"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { Calendar, Tag, Plus, X, Mic, Video, Loader2 } from "lucide-react";
import type { JournalEntry } from "./journal-page";
import { api } from "@/lib/api";

interface JournalEditorProps {
 entry: JournalEntry;
 onChange: (data: { title: string; content: string }) => void;
 onWordCountChange?: (count: number) => void;
 focusMode?: boolean;
 tags: string[];
 onTagsChange: (tags: string[]) => void;
 emotion: { label: string; color: string };
}

function plainTextToBlocks(text: string) {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return [{ type: "paragraph" as const, content: [] }];
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => ({
      type: "paragraph" as const,
      content: [
        {
          type: "text" as const,
          text: paragraph.trim(),
          styles: {},
        },
      ],
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blocksToPlainText(blocks: any[]): string {
 if (!Array.isArray(blocks)) return "";
 return blocks
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 .map((block: any) => {
 const content = block?.content;
 if (!content) return "";
 if (Array.isArray(content)) {
 return content
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 .map((inline: any) =>
 typeof inline === "string" ? inline : inline?.text ?? "",
 )
 .join("");
 }
 return typeof content === "string" ? content : "";
 })
 .join("\n\n")
 .trim();
}

export function JournalEditor({
 entry,
 onChange,
 onWordCountChange,
 focusMode,
 tags = [],
 onTagsChange,
 emotion,
}: JournalEditorProps) {
 const { resolvedTheme } = useTheme();
 const [title, setTitle] = useState(entry.title);
 const [wordCount, setWordCount] = useState(0);
 const [tagInput, setTagInput] = useState("");
 const [isAddingTag, setIsAddingTag] = useState(false);
 const tagInputRef = useRef<HTMLInputElement>(null);
 const lastEntryIdRef = useRef(entry.id);

 const [mediaUrl, setMediaUrl] = useState<string | null>(null);
 const [loadingMedia, setLoadingMedia] = useState(false);

 useEffect(() => {
 if (entry.type === "audio" || entry.type === "video") {
 setLoadingMedia(true);
 setMediaUrl(null);
 api.sources.getFileUrl(entry.id)
 .then((res: any) => {
 if (res && res.url) {
 setMediaUrl(res.url);
 }
 })
 .catch((err) => {
 console.error("Failed to fetch media file URL:", err);
 })
 .finally(() => {
 setLoadingMedia(false);
 });
 } else {
 setMediaUrl(null);
 }
 }, [entry.id, entry.type]);

 const editor = useCreateBlockNote({
 initialContent: plainTextToBlocks(entry.content),
 });

 useEffect(() => {
 if (lastEntryIdRef.current === entry.id) return;
 lastEntryIdRef.current = entry.id;
 setTitle(entry.title);
 setIsAddingTag(false);
 setTagInput("");
 try {
 editor.replaceBlocks(editor.document, plainTextToBlocks(entry.content));
 } catch {
 // editor not ready
 }
 }, [entry.id, entry.title, entry.content, editor]);

 const recomputeWordCount = useCallback(() => {
 const text = blocksToPlainText(editor.document);
 const words = text.trim().length
 ? text.trim().split(/\s+/).filter(Boolean).length
 : 0;
 setWordCount(words);
 onWordCountChange?.(words);
 }, [editor, onWordCountChange]);

 useEffect(() => {
 const unsubscribe = editor.onChange(() => {
 const content = blocksToPlainText(editor.document);
 onChange({ title, content });
 recomputeWordCount();
 });
 recomputeWordCount();
 return () => {
 if (typeof unsubscribe === "function") unsubscribe();
 };
 }, [editor, title, onChange, recomputeWordCount]);

 const handleTitleChange = (value: string) => {
 setTitle(value);
 onChange({ title: value, content: blocksToPlainText(editor.document) });
 };

 const handleAddTag = () => {
 const cleaned = tagInput.trim().toLowerCase().replace(/#/g, "");
 if (cleaned && !tags.includes(cleaned)) {
 onTagsChange([...tags, cleaned]);
 }
 setTagInput("");
 setIsAddingTag(false);
 };

 const handleRemoveTag = (tagToRemove: string) => {
 onTagsChange(tags.filter((t) => t !== tagToRemove));
 };

 const dateLabel = useMemo(() => {
 const d = new Date(entry.createdAt);
 if (isNaN(d.getTime())) return "Draft";
 return d.toLocaleDateString("en-US", {
 weekday: "long",
 month: "long",
 day: "numeric",
 year: "numeric",
 });
 }, [entry.createdAt]);

 return (
 <div className="flex h-full flex-col overflow-hidden bg-transparent">
 <div 
   className="flex-1 overflow-y-auto cursor-text"
   onClick={(e) => {
     if (e.target === e.currentTarget) {
       editor.focus();
     }
   }}
 >
 <div
   className={
     focusMode
       ? "mx-auto max-w-2xl px-6 py-16 sm:px-10 min-h-full pb-32 flex flex-col transition-all duration-500 ease-in-out"
       : "mx-auto max-w-2xl px-6 py-10 sm:px-10 min-h-full pb-32 flex flex-col transition-all duration-500 ease-in-out"
   }
   onClick={(e) => {
     if (e.target === e.currentTarget) {
       editor.focus();
     }
   }}
 >
 {/* Metadata Row: Date & Emotion */}
 <div className="flex flex-wrap items-center gap-3 mb-6 select-none">
 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs text-muted-foreground">
 <Calendar className="w-3.5 h-3.5" />
 <span>{dateLabel}</span>
 </div>

 <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${emotion.color}`}>
 <span>Emotion: {emotion.label}</span>
 </div>
 </div>

 {/* Media Player for Audio/Video Journal */}
 {(entry.type === "audio" || entry.type === "video") && (
 <div className="mb-6 p-4 rounded-2xl border bg-accent/25 backdrop-blur-md">
 <div className="flex items-center gap-2 mb-3">
 {entry.type === "audio" ? (
 <Mic className="w-4 h-4 text-primary animate-pulse" />
 ) : (
 <Video className="w-4 h-4 text-rose-500 animate-pulse" />
 )}
 <span className="text-xs font-bold text-foreground">
 {entry.type === "audio" ? "Audio Journal Recording" : "Video Journal Reflection"}
 </span>
 {loadingMedia && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />}
 </div>

 {loadingMedia ? (
 <div className="h-12 bg-muted animate-pulse rounded-xl" />
 ) : mediaUrl ? (
 entry.type === "audio" ? (
 <audio src={mediaUrl} controls className="w-full focus:outline-none" />
 ) : (
 <video src={mediaUrl} controls className="w-full rounded-xl bg-neutral-950 object-cover max-h-[300px] border border-border shadow" />
 )
 ) : (
 <p className="text-xs text-muted-foreground italic">Media file could not be loaded.</p>
 )}
 </div>
 )}

 {/* Title Input */}
 <input
 type="text"
 value={title}
 onChange={(e) => handleTitleChange(e.target.value)}
 placeholder="Untitled Note"
 className="mb-4 w-full border-none bg-transparent text-3xl font-extrabold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40 sm:text-4xl transition-all focus:placeholder:text-muted-foreground/25"
 aria-label="Entry title"
 />

 {/* Tags Editor Row */}
 <div className="flex flex-wrap items-center gap-2 mb-8 select-none">
 <Tag className="w-3.5 h-3.5 text-muted-foreground/60 mr-1" />
 {tags.map((tag) => (
 <span
 key={tag}
 className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
 >
 #{tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="hover:text-destructive focus:outline-none"
 aria-label={`Remove tag ${tag}`}
 >
 <X className="w-3 h-3" />
 </button>
 </span>
 ))}

 {isAddingTag ? (
 <input
 ref={tagInputRef}
 type="text"
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 onBlur={handleAddTag}
 onKeyDown={(e) => {
 if (e.key === "Enter" || e.key === ",") {
 e.preventDefault();
 handleAddTag();
 } else if (e.key === "Escape") {
 setIsAddingTag(false);
 }
 }}
 placeholder="new-tag..."
 className="h-6 w-20 px-2 text-xs rounded-full border border-border bg-background outline-none text-foreground"
 autoFocus
 />
 ) : (
 <button
 type="button"
 onClick={() => setIsAddingTag(true)}
 className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
 >
 <Plus className="w-3 h-3" />
 Add tag
 </button>
 )}
 </div>

 {/* BlockNote Editor */}
 <div className="journal-blocknote prose prose-stone dark:prose-invert max-w-none text-foreground flex-1 min-h-[400px]">
 <BlockNoteView
 editor={editor}
 theme={resolvedTheme === "dark" ? "dark" : "light"}
 className="h-full -mx-[46px]"
 />
 </div>
 </div>
 </div>
 </div>
 );
}
