"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X, BookOpen, Clock, FileText, Sparkles, Mic, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { JournalEntry } from "./journal-page";

interface JournalEntryListProps {
 entries: JournalEntry[];
 activeEntryId: string;
 onSelect: (id: string) => void;
 onNewEntry: () => void;
 onClose?: () => void;
 onRecordPress?: () => void;
}

interface JournalMetadata {
 tags?: string[];
 emotion?: string;
}

function getDateGroup(dateStr: string): string {
 const date = new Date(dateStr);
 const now = new Date();
 const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
 const startOfWeek = new Date(startOfToday.getTime() - 7 * 86400000);

 if (date >= startOfToday) return "Today";
 if (date >= startOfYesterday) return "Yesterday";
 if (date >= startOfWeek) return "This week";
 return "Older";
}

function formatRelative(dateStr: string): string {
 const d = new Date(dateStr);
 if (isNaN(d.getTime())) return "Draft";
 return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWordCount(text: string): number {
 if (!text) return 0;
 return text.trim().split(/\s+/).filter(Boolean).length;
}

function getEntryEmotion(entry: JournalEntry): { label: string; dotColor: string } {
 if (entry.metadataJson) {
 try {
 const parsed = JSON.parse(entry.metadataJson) as JournalMetadata;
 if (parsed.emotion) {
 const dotColors: Record<string, string> = {
 excited: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
 calm: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
 anxious: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]",
 homesick: "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]",
 motivated: "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]",
 reflective: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]",
 };
 const key = parsed.emotion.toLowerCase();
 return {
 label: parsed.emotion,
 dotColor: dotColors[key] || "bg-zinc-500",
 };
 }
 } catch {
 // ignore
 }
 }

 // Fallback keyword-based emotion classifier
 const t = (entry.content ?? "").toLowerCase();
 let excited = (t.match(/(excited|happy|great|laugh|celebrate|samosa|joy|wonderful|love|thrill)/g) || []).length;
 let calm = (t.match(/(calm|peace|silent|soothing|still|breeze|relaxed|rest|nature|pond)/g) || []).length;
 let anxious = (t.match(/(doubt|anxious|stress|struggle|shake|fear|worry|shaking|defeat|frustrated)/g) || []).length;
 let homesick = (t.match(/(homesick|miss|sad|lonely|mother|father|home|peeling|homesickness)/g) || []).length;
 let motivated = (t.match(/(motivated|focus|perseverance|study|read|work|determined|syllab|learn|class)/g) || []).length;
 let reflective = (t.match(/(reflect|think|thought|memories|tunnel|blessing|realized|mind)/g) || []).length + 1;

 const scores = { excited, calm, anxious, homesick, motivated, reflective };
 const maxKey = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] >= scores[b as keyof typeof scores] ? a : b);

 const dotColors = {
 excited: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
 calm: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
 anxious: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]",
 homesick: "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]",
 motivated: "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]",
 reflective: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]",
 };

 return {
 label: maxKey.charAt(0).toUpperCase() + maxKey.slice(1),
 dotColor: dotColors[maxKey as keyof typeof dotColors] || "bg-zinc-500",
 };
}

function getEntryTags(entry: JournalEntry): string[] {
 if (entry.metadataJson) {
 try {
 const parsed = JSON.parse(entry.metadataJson) as JournalMetadata;
 if (Array.isArray(parsed.tags)) return parsed.tags;
 } catch {
 // ignore
 }
 }
 const hashtags = entry.content.match(/#\w+/g);
 if (hashtags) {
 return Array.from(new Set(hashtags.map((tag) => tag.slice(1))));
 }
 return [];
}

export function JournalEntryList({
 entries,
 activeEntryId,
 onSelect,
 onNewEntry,
 onClose,
 onRecordPress,
}: JournalEntryListProps) {
 const [search, setSearch] = useState("");

 const grouped = useMemo(() => {
 const q = search.trim().toLowerCase();
 const filtered = q
 ? entries.filter(
 (e) =>
 e.title.toLowerCase().includes(q) ||
 e.content.toLowerCase().includes(q),
 )
 : entries;

 const sorted = [...filtered].sort(
 (a, b) =>
 new Date(b.updatedAt ?? b.createdAt).getTime() -
 new Date(a.updatedAt ?? a.createdAt).getTime(),
 );

 const map = new Map<string, JournalEntry[]>();
 for (const entry of sorted) {
 const key = getDateGroup(entry.updatedAt ?? entry.createdAt);
 const list = map.get(key) ?? [];
 list.push(entry);
 map.set(key, list);
 }
 const order = ["Today", "Yesterday", "This week", "Older"];
 return order
 .filter((k) => map.has(k))
 .map((k) => ({ label: k, entries: map.get(k)! }));
 }, [entries, search]);

 return (
 <div className="flex h-full flex-col bg-card select-none border-r border-border">
 {/* Header */}
 <div className="flex items-center justify-between gap-2 px-4.5 pt-5 pb-3">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-lg bg-background border border-border">
 <BookOpen className="h-4 w-4 text-foreground/80" />
 </div>
 <h2 className="text-xs font-bold tracking-wider uppercase text-foreground/85">
 Journal
 </h2>
 </div>
 <div className="flex items-center gap-1.5">
 {onRecordPress && (
 <Button
 onClick={onRecordPress}
 variant="outline"
 size="sm"
 className="h-8 w-8 p-0 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground shrink-0"
 title="Record audio/video journal"
 >
 <Mic className="h-4 w-4 text-primary" />
 </Button>
 )}
 <Button
 onClick={onNewEntry}
 size="sm"
 className="h-8 gap-1 px-3 text-[11px] font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.97] transition-all"
 >
 <Plus className="h-3.5 w-3.5" />
 New
 </Button>
 {onClose ? (
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 md:hidden rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground"
 onClick={onClose}
 aria-label="Close list"
 >
 <X className="h-4 w-4" />
 </Button>
 ) : null}
 </div>
 </div>

 {/* Search Input */}
 <div className="px-4.5 pb-4">
 <div className="relative group">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
 <Input
 type="text"
 placeholder="Search entries..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="h-9.5 pl-9.5 pr-8 text-xs rounded-xl border-2 border-border bg-background focus:bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all"
 />
 {search && (
 <button
 onClick={() => setSearch("")}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-accent transition-colors"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* Entry Feed List */}
 <ScrollArea className="flex-1 h-full min-h-0 px-2.5 pb-4">
 <div className="space-y-4 pr-1">
 {grouped.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 <BookOpen className="h-7 w-7 text-muted-foreground/40 stroke-[1.5] mb-2" />
 <p className="text-[11px] text-muted-foreground font-medium max-w-[150px] leading-relaxed">
 {search ? "No matching entries found." : "Your journal is empty."}
 </p>
 </div>
 ) : (
 grouped.map((group) => (
 <div key={group.label} className="space-y-1.5">
 <p className="px-2 pb-0.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/60">
 {group.label}
 </p>
 <div className="space-y-1">
 {group.entries.map((entry) => {
 const active = entry.id === activeEntryId;
 const wordCount = getWordCount(entry.content);
 const isTemp = entry.id.startsWith("temp_");
 const emotion = getEntryEmotion(entry);
 const tags = getEntryTags(entry);

 return (
 <button
 key={entry.id}
 type="button"
 onClick={() => onSelect(entry.id)}
 disabled={isTemp}
 className={cn(
 "group relative w-full rounded-xl p-3 text-left transition-all duration-200 border-2",
 active
 ? "bg-accent border-border shadow-sm text-foreground hover:translate-x-0"
 : "bg-transparent border-transparent hover:bg-accent/40 hover:border-border/40 hover:translate-x-0.5 active:translate-x-0",
 isTemp && "opacity-60 cursor-not-allowed"
 )}
 >
 {/* Active Indicator Line */}
 {active && (
 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
 )}

 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2 min-w-0 flex-1">
 {entry.type === "audio" ? (
 <Mic className="h-3.5 w-3.5 text-primary shrink-0" />
 ) : entry.type === "video" ? (
 <Video className="h-3.5 w-3.5 text-rose-500 shrink-0" />
 ) : (
 <FileText className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
 )}
 <p
 className={cn(
 "truncate text-xs font-bold tracking-tight leading-snug flex-1",
 active ? "text-foreground" : "text-foreground/90 group-hover:text-foreground",
 !entry.title && "text-muted-foreground italic font-normal",
 )}
 >
 {entry.title || (isTemp ? "Drafting..." : "Untitled Note")}
 </p>
 </div>
 
 <span className="shrink-0 text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground transition-colors font-medium">
 {formatRelative(entry.updatedAt ?? entry.createdAt)}
 </span>
 </div>
 
 <p className={cn(
 "mt-1.5 line-clamp-2 text-[11px] leading-relaxed transition-colors",
 active ? "text-muted-foreground" : "text-muted-foreground/80 group-hover:text-muted-foreground"
 )}>
 {entry.preview || (isTemp ? "Starting draft..." : "Write your thoughts...")}
 </p>
 
 {/* Emotion & Tags indicators in default view */}
 <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold">
 <span className="flex items-center gap-1">
 <span className={cn("w-1.5 h-1.5 rounded-full", emotion.dotColor)} />
 <span className="text-muted-foreground/80 font-bold uppercase tracking-wide text-[8px]">{emotion.label}</span>
 </span>
 
 {tags.slice(0, 2).map((tag) => (
 <span key={tag} className="px-1 py-0.2 rounded bg-muted text-muted-foreground text-[8px] font-bold border border-border">
 #{tag}
 </span>
 ))}

 <span className="ml-auto text-muted-foreground/60 font-medium group-hover:text-muted-foreground/80 transition-colors">
 {wordCount} words
 </span>
 </div>
 </button>
 );
 })}
 </div>
 </div>
 ))
 )}
 </div>
 </ScrollArea>
 </div>
 );
}
