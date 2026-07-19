"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
 Loader2,
 Maximize2,
 Menu,
 Minimize2,
 PenLine,
 Trash2,
 CheckCircle2,
 AlertCircle,
 CloudLightning,
 LayoutGrid,
 BookOpen,
 Search,
 Sparkles,
 SlidersHorizontal,
 X,
 Tag,
 Clock,
 FileText,
 Share2,
 Globe,
 Lock as LockIcon,
 Link2,
 Mic,
 Video,
} from "lucide-react";
import { JournalEntryList } from "@/components/journal/entry-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
 Dialog,
 DialogContent,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatRelative(dateStr: string): string {
 const d = new Date(dateStr);
 if (isNaN(d.getTime())) return "Draft";
 return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function slugify(text: string): string {
 return text
 .toString()
 .toLowerCase()
 .trim()
 .replace(/\s+/g, "-") // Replace spaces with -
 .replace(/[^\w\-]+/g, "") // Remove all non-word chars
 .replace(/\-\-+/g, "-") // Replace multiple - with single -
 .replace(/^-+/, "") // Trim - from start of text
 .replace(/-+$/, ""); // Trim - from end of text
}

function generateJournalSlug(title: string): string {
 const base = title ? slugify(title) : "journal";
 const suffix = Math.random().toString(36).substring(2, 8);
 return `${base}-${suffix}`;
}

const JournalEditor = dynamic(
 () => import("@/components/journal/editor").then((m) => m.JournalEditor),
 {
 ssr: false,
 loading: () => (
 <div className="flex h-full items-center justify-center text-sm text-muted-foreground bg-background">
 <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
 Loading editor...
 </div>
 ),
 },
);

export interface JournalEntry {
 id: string;
 title: string;
 preview: string;
 content: string;
 createdAt: string;
 updatedAt: string;
 metadataJson?: string;
 slug?: string;
 privacyLevel?: string;
 type?: string;
}

interface JournalMetadata {
 tags?: string[];
 emotion?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function makePreview(content: string): string {
 const text = (content ?? "").replace(/\s+/g, " ").trim();
 if (!text) return "";
 return text.length > 140 ? text.slice(0, 140) + "..." : text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSourceToEntry(s: any): JournalEntry {
 const content = s.plainText ?? s.content ?? "";
 return {
 id: s.id,
 title: s.title ?? "",
 preview: makePreview(content),
 content,
 createdAt: s.createdAt ?? new Date().toISOString(),
 updatedAt: s.updatedAt ?? s.createdAt ?? new Date().toISOString(),
 metadataJson: s.metadataJson ?? null,
 slug: s.slug ?? "",
 privacyLevel: s.privacyLevel ?? "normal",
 type: s.type ?? "journal",
 };
}

function getWordCount(text: string): number {
 if (!text) return 0;
 return text.trim().split(/\s+/).filter(Boolean).length;
}

function getEntryEmotion(entry: JournalEntry): { label: string; color: string } {
 if (entry.metadataJson) {
 try {
 const parsed = JSON.parse(entry.metadataJson) as JournalMetadata;
 if (parsed.emotion) {
 const colors: Record<string, string> = {
 excited: "text-amber-500 bg-amber-500/10 border-amber-500/20",
 calm: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
 anxious: "text-rose-500 bg-rose-500/10 border-rose-500/20",
 homesick: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
 motivated: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
 reflective: "text-purple-500 bg-purple-500/10 border-purple-500/20",
 };
 const key = parsed.emotion.toLowerCase();
 return {
 label: parsed.emotion,
 color: colors[key] || "text-muted-foreground bg-accent border-border",
 };
 }
 } catch {
 // ignore
 }
 }

 // Heuristic emotional sentiment analysis
 const t = (entry.content ?? "").toLowerCase();
 let excited = (t.match(/(excited|happy|great|laugh|celebrate|samosa|joy|wonderful|love|thrill)/g) || []).length;
 let calm = (t.match(/(calm|peace|silent|soothing|still|breeze|relaxed|rest|nature|pond)/g) || []).length;
 let anxious = (t.match(/(doubt|anxious|stress|struggle|shake|fear|worry|shaking|defeat|frustrated)/g) || []).length;
 let homesick = (t.match(/(homesick|miss|sad|lonely|mother|father|home|peeling|homesickness)/g) || []).length;
 let motivated = (t.match(/(motivated|focus|perseverance|study|read|work|determined|syllab|learn|class)/g) || []).length;
 let reflective = (t.match(/(reflect|think|thought|memories|tunnel|blessing|realized|mind)/g) || []).length + 1;

 const scores = { excited, calm, anxious, homesick, motivated, reflective };
 const maxKey = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] >= scores[b as keyof typeof scores] ? a : b);

 const colors = {
 excited: "text-amber-500 bg-amber-500/10 border-amber-500/20",
 calm: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
 anxious: "text-rose-500 bg-rose-500/10 border-rose-500/20",
 homesick: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
 motivated: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
 reflective: "text-purple-500 bg-purple-500/10 border-purple-500/20",
 };

 return {
 label: maxKey.charAt(0).toUpperCase() + maxKey.slice(1),
 color: colors[maxKey as keyof typeof colors] || "text-muted-foreground bg-accent border-border",
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

function useRelativeSavedLabel(savedAt: number | null) {
 const [, force] = useState(0);
 useEffect(() => {
 if (!savedAt) return;
 const id = window.setInterval(() => force((n) => n + 1), 15_000);
 return () => window.clearInterval(id);
 }, [savedAt]);

 if (!savedAt) return "";
 const seconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000));
 if (seconds < 60) return `Saved ${seconds}s ago`;
 const minutes = Math.round(seconds / 60);
 if (minutes < 60) return `Saved ${minutes}m ago`;
 const hours = Math.round(minutes / 60);
 return `Saved ${hours}h ago`;
}

interface JournalPageProps {
 fallbackData?: JournalEntry[];
}

export function JournalPage({ fallbackData = [] }: JournalPageProps) {
 // SWR Hook with server-rendered fallback
 const { data: entries = [], mutate } = useSWR<JournalEntry[]>(
 "/api/sources?type=journal",
 async () => {
 const data = await api.journal.list();
 return (Array.isArray(data) ? data : []).map(mapSourceToEntry);
 },
 {
 fallbackData,
 revalidateOnMount: false,
 revalidateOnFocus: false,
 }
 );

 const [activeEntryId, setActiveEntryId] = useState<string>(() => {
 return fallbackData[0]?.id ?? "";
 });

 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();

 const focusMode = searchParams.get("focus") === "true";
 const setFocusMode = useCallback(
 (val: boolean | ((prev: boolean) => boolean)) => {
 const nextVal = typeof val === "function" ? val(focusMode) : val;
 const params = new URLSearchParams(searchParams.toString());
 if (nextVal) {
 params.set("focus", "true");
 } else {
 params.delete("focus");
 }
 router.replace(`${pathname}?${params.toString()}`);
 },
 [router, pathname, searchParams, focusMode],
 );

 // UI Modes
 const [viewMode, setViewMode] = useState<"split" | "gallery">("gallery");
 const [creating, setCreating] = useState(false);
 const [listOpen, setListOpen] = useState(false);
 const [confirmDelete, setConfirmDelete] = useState(false);
 const [recorderOpen, setRecorderOpen] = useState(false);

 // Sharing States
 const [shareOpen, setShareOpen] = useState(false);
 const [sharePrivacy, setSharePrivacy] = useState("normal");
 const [shareSlug, setShareSlug] = useState("");

 // Search, Filtering & Sorting States
 const [search, setSearch] = useState("");
 const [isAiSearch, setIsAiSearch] = useState(false);
 const [isSearching, setIsSearching] = useState(false);
 const [searchResults, setSearchResults] = useState<Set<string> | null>(null);
 const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "emotion" | "length">("date-desc");
 const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
 const [selectedTag, setSelectedTag] = useState<string>("all");

 // Save states
 const [saveState, setSaveState] = useState<SaveState>("idle");
 const [savedAt, setSavedAt] = useState<number | null>(null);
 const [wordCount, setWordCount] = useState(0);

 const draftRef = useRef<{ title: string; content: string; metadataJson?: string } | null>(null);
 const lastSavedRef = useRef<{
 id: string;
 title: string;
 content: string;
 metadataJson?: string;
 } | null>(null);
 const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 // Auto-select first entry if none is selected
 useEffect(() => {
 if (entries.length > 0 && (!activeEntryId || !entries.some(e => e.id === activeEntryId))) {
 setActiveEntryId(entries[0].id);
 }
 }, [entries, activeEntryId]);

 const activeEntry = useMemo(
 () => entries.find((e) => e.id === activeEntryId),
 [entries, activeEntryId],
 );

 // Sync share preferences on active entry change
 useEffect(() => {
 if (!activeEntry) return;
 setSharePrivacy(activeEntry.privacyLevel ?? "normal");
 setShareSlug(activeEntry.slug ?? "");
 }, [activeEntryId, activeEntry]);

 const handleShareSave = useCallback(
 async (newPrivacy: string, newSlug: string) => {
 if (!activeEntry) return;
 const finalSlug = newSlug.trim() || generateJournalSlug(activeEntry.title);
 try {
 const updated = await api.sources.update(activeEntry.id, {
 privacyLevel: newPrivacy,
 slug: finalSlug,
 });
 const mapped = mapSourceToEntry(updated);

 const nextEntries = entries.map((e) => (e.id === activeEntry.id ? mapped : e));
 mutate(nextEntries, false);
 toast.success("Sharing preferences saved successfully!");
 setShareOpen(false);
 } catch (err) {
 console.error("[journal] share save failed", err);
 toast.error("Failed to update sharing preferences");
 }
 },
 [activeEntry, entries, mutate],
 );

 // Reset draft refs on active entry change
 useEffect(() => {
 if (!activeEntry) {
 draftRef.current = null;
 lastSavedRef.current = null;
 setSaveState("idle");
 setSavedAt(null);
 return;
 }
 draftRef.current = {
 title: activeEntry.title,
 content: activeEntry.content,
 metadataJson: activeEntry.metadataJson,
 };
 lastSavedRef.current = {
 id: activeEntry.id,
 title: activeEntry.title,
 content: activeEntry.content,
 metadataJson: activeEntry.metadataJson,
 };
 setSaveState("idle");
 setSavedAt(activeEntry.updatedAt ? Date.parse(activeEntry.updatedAt) : null);
 }, [activeEntryId]);

 const flushSave = useCallback(async () => {
 const draft = draftRef.current;
 const last = lastSavedRef.current;
 if (!draft || !last) return;
 if (
 draft.title === last.title &&
 draft.content === last.content &&
 draft.metadataJson === last.metadataJson
 ) {
 return;
 }
 const targetId = last.id;
 if (targetId.startsWith("temp_")) return;

 setSaveState("saving");
 try {
 const updated = await api.journal.update(targetId, {
 title: draft.title,
 content: draft.content,
 metadataJson: draft.metadataJson,
 });
 
 const mapped = mapSourceToEntry(updated);
 lastSavedRef.current = {
 id: targetId,
 title: draft.title,
 content: draft.content,
 metadataJson: draft.metadataJson,
 };

 const nextEntries = entries.map((e) => (e.id === targetId ? mapped : e));
 mutate(nextEntries, false);

 setSavedAt(Date.now());
 setSaveState("saved");
 } catch (err) {
 console.error("[journal] save failed", err);
 setSaveState("error");
 }
 }, [mutate]);

 const scheduleSave = useCallback(() => {
 if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
 saveTimerRef.current = setTimeout(() => {
 flushSave();
 }, 1200);
 }, [flushSave]);

 useEffect(() => {
 const onBeforeUnload = () => {
 if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
 flushSave();
 };
 window.addEventListener("beforeunload", onBeforeUnload);
 return () => {
 window.removeEventListener("beforeunload", onBeforeUnload);
 if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
 flushSave();
 };
 }, [flushSave]);

 const handleEditorChange = useCallback(
 ({ title, content }: { title: string; content: string }) => {
 if (!activeEntry) return;
 draftRef.current = {
 title,
 content,
 metadataJson: draftRef.current?.metadataJson ?? activeEntry.metadataJson,
 };

 const nextEntries = entries.map((e) =>
 e.id === activeEntryId
 ? {
 ...e,
 title,
 content,
 preview: makePreview(content),
 updatedAt: new Date().toISOString(),
 }
 : e
 );
 mutate(nextEntries, false);

 scheduleSave();
 },
 [activeEntryId, activeEntry, mutate, scheduleSave],
 );

 const handleTagsChange = useCallback(
 (newTags: string[]) => {
 if (!activeEntry) return;
 const currentMeta = activeEntry.metadataJson ? JSON.parse(activeEntry.metadataJson) : {};
 
 // Auto classify emotion based on current content during tag updates
 const emotionResult = getEntryEmotion(activeEntry);
 const updatedMeta = { 
 ...currentMeta, 
 tags: newTags,
 emotion: emotionResult.label.toLowerCase()
 };
 
 const metadataStr = JSON.stringify(updatedMeta);
 draftRef.current = {
 title: draftRef.current?.title ?? activeEntry.title,
 content: draftRef.current?.content ?? activeEntry.content,
 metadataJson: metadataStr,
 };

 const nextEntries = entries.map((e) =>
 e.id === activeEntryId
 ? {
 ...e,
 metadataJson: metadataStr,
 updatedAt: new Date().toISOString(),
 }
 : e
 );
 mutate(nextEntries, false);

 scheduleSave();
 },
 [activeEntryId, activeEntry, mutate, scheduleSave]
 );

 const handleNewEntry = useCallback(async () => {
 if (creating) return;
 if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
 await flushSave();
 
 setCreating(true);
 const tempId = "temp_" + Date.now();
 const tempEntry: JournalEntry = {
 id: tempId,
 title: "",
 preview: "",
 content: "",
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 };

 mutate([tempEntry, ...entries], false);
 setActiveEntryId(tempId);
 setListOpen(false);
 setViewMode("split");

 try {
 const created = await api.journal.create({ title: "", content: "" });
 const mapped = mapSourceToEntry(created);
 
 const nextEntries = entries.map((e) => (e.id === tempId ? mapped : e));
 if (!nextEntries.some((e) => e.id === mapped.id)) {
 nextEntries.unshift(mapped);
 }
 mutate(nextEntries, false);
 setActiveEntryId(mapped.id);
 } catch (err) {
 console.error("[journal] create failed", err);
 mutate(entries.filter((e) => e.id !== tempId), false);
 setActiveEntryId(entries[0]?.id ?? "");
 } finally {
 setCreating(false);
 }
 }, [creating, flushSave, mutate, entries]);

 const handleDelete = useCallback(async () => {
 if (!activeEntry) return;
 const id = activeEntry.id;
 setConfirmDelete(false);

 const oldEntries = [...entries];
 const nextActiveId = entries.find((e) => e.id !== id)?.id ?? "";

 mutate(entries.filter((e) => e.id !== id), false);
 setActiveEntryId(nextActiveId);

 try {
 await api.sources.delete(id);
 } catch (err) {
 console.error("[journal] delete failed", err);
 mutate(oldEntries, false);
 setActiveEntryId(id);
 }
 }, [activeEntry, entries, mutate]);

 // AI & Local Search Execution
 const handleSearchSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const query = search.trim();
 if (!query) {
 setSearchResults(null);
 return;
 }

 setIsSearching(true);
 try {
 if (isAiSearch) {
 const data = await api.search.query(query, { type: "journal" });
 const matchedIds = new Set<string>((data.results || []).map((r: any) => String(r.id)));
 setSearchResults(matchedIds);
 } else {
 const q = query.toLowerCase();
 const matched = entries
 .filter((e) => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q))
 .map((e) => e.id);
 setSearchResults(new Set<string>(matched));
 }
 } catch (err) {
 console.error("Search failed", err);
 } finally {
 setIsSearching(false);
 }
 };

 const clearSearch = () => {
 setSearch("");
 setSearchResults(null);
 };

 // Keyboard: "n" creates new entry
 useEffect(() => {
 const handler = (e: KeyboardEvent) => {
 if (e.key !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
 const target = e.target as HTMLElement | null;
 if (!target) return;
 const tag = target.tagName?.toLowerCase();
 const editable = tag === "input" || tag === "textarea" || target.isContentEditable;
 if (editable) return;
 e.preventDefault();
 handleNewEntry();
 };
 window.addEventListener("keydown", handler);
 return () => window.removeEventListener("keydown", handler);
 }, [handleNewEntry]);

 // Unique tags list for filter bar
 const allUniqueTags = useMemo(() => {
 const tagsSet = new Set<string>();
 entries.forEach((entry) => {
 getEntryTags(entry).forEach((t) => tagsSet.add(t));
 });
 return Array.from(tagsSet);
 }, [entries]);

 // Filtered & Sorted list of entries for cards/sidebar
 const processedEntries = useMemo(() => {
 let result = [...entries];

 // 1. Filter by Search results
 if (searchResults !== null) {
 result = result.filter((e) => searchResults.has(e.id));
 }

 // 2. Filter by Emotion
 if (selectedEmotion !== "all") {
 result = result.filter((e) => getEntryEmotion(e).label.toLowerCase() === selectedEmotion);
 }

 // 3. Filter by Tag
 if (selectedTag !== "all") {
 result = result.filter((e) => getEntryTags(e).includes(selectedTag));
 }

 // 4. Sort
 result.sort((a, b) => {
 if (sortBy === "date-desc") {
 return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
 }
 if (sortBy === "date-asc") {
 return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
 }
 if (sortBy === "emotion") {
 const emoA = getEntryEmotion(a).label;
 const emoB = getEntryEmotion(b).label;
 return emoA.localeCompare(emoB);
 }
 if (sortBy === "length") {
 return getWordCount(b.content) - getWordCount(a.content);
 }
 return 0;
 });

 return result;
 }, [entries, searchResults, selectedEmotion, selectedTag, sortBy]);

  const moodCounts = useMemo(() => {
    const counts = {
      reflective: 0,
      excited: 0,
      calm: 0,
      anxious: 0,
      homesick: 0,
      motivated: 0,
    };
    entries.forEach((e) => {
      const mood = getEntryEmotion(e).label.toLowerCase();
      if (mood in counts) {
        counts[mood as keyof typeof counts]++;
      }
    });
    return counts;
  }, [entries]);

  const emotionConfig: Record<string, { label: string; color: string; bgClass: string }> = {
    reflective: {
      label: "Reflective",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
      bgClass: "bg-purple-500",
    },
    excited: {
      label: "Excited",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
      bgClass: "bg-amber-500",
    },
    calm: {
      label: "Calm",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
      bgClass: "bg-emerald-500",
    },
    anxious: {
      label: "Anxious",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40",
      bgClass: "bg-rose-500",
    },
    homesick: {
      label: "Homesick",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40",
      bgClass: "bg-indigo-500",
    },
    motivated: {
      label: "Motivated",
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40",
      bgClass: "bg-cyan-500",
    },
  };

 const activeEntryTags = useMemo(() => {
 return activeEntry ? getEntryTags(activeEntry) : [];
 }, [activeEntry]);

 const activeEntryEmotion = useMemo(() => {
 return activeEntry ? getEntryEmotion(activeEntry) : { label: "Reflective", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" };
 }, [activeEntry]);

 const savedLabel = useRelativeSavedLabel(savedAt);
 const readingTime = Math.max(1, Math.ceil(wordCount / 200));

 return (
 <div className="flex h-full w-full flex-1 min-h-0 overflow-hidden bg-background text-foreground">
 
 {/* Sidebar - only shown in Split View Mode */}
 {viewMode === "split" && !focusMode && (
 <aside className="hidden w-[280px] shrink-0 border-r border-border bg-card md:flex md:flex-col transition-all duration-300">
 <JournalEntryList
 entries={entries}
 activeEntryId={activeEntryId}
 onSelect={setActiveEntryId}
 onNewEntry={handleNewEntry}
 onRecordPress={() => setRecorderOpen(true)}
 />
 </aside>
 )}

 {/* Sidebar - Mobile Sheet */}
 {listOpen && viewMode === "split" && !focusMode && (
 <div className="fixed inset-0 z-40 md:hidden transition-all duration-300">
 <div
 className="absolute inset-0 bg-black/40"
 onClick={() => setListOpen(false)}
 />
 <div className="absolute inset-y-0 left-0 w-[80vw] max-w-[320px] border-r border-border bg-card shadow-2xl">
 <JournalEntryList
 entries={entries}
 activeEntryId={activeEntryId}
 onSelect={(id) => {
 setActiveEntryId(id);
 setListOpen(false);
 }}
 onNewEntry={handleNewEntry}
 onClose={() => setListOpen(false)}
 onRecordPress={() => setRecorderOpen(true)}
 />
 </div>
 </div>
 )}

 {/* Main Container */}
 <main className="relative flex min-w-0 flex-1 flex-col bg-background">
 
 {/* Top Control Bar */}
 <div
 className={cn(
 "flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-background z-10 select-none transition-all duration-300",
 focusMode && viewMode === "split" && "opacity-20 hover:opacity-100",
 )}
 >
 {viewMode === "split" && !focusMode && (
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9 md:hidden rounded-xl border border-border bg-background text-foreground"
 onClick={() => setListOpen(true)}
 aria-label="Open entries"
 >
 <Menu className="h-4.5 w-4.5" />
 </Button>
 )}

 {/* View Mode Toggle Switch */}
 <div className="flex items-center gap-1.5 p-1 rounded-xl bg-accent border border-border">
 <Button
 variant={viewMode === "split" ? "secondary" : "ghost"}
 size="sm"
 onClick={() => setViewMode("split")}
 className="h-7.5 gap-1.5 rounded-lg text-xs font-semibold px-3"
 >
 <BookOpen className="w-3.5 h-3.5" />
 <span>Write Mode</span>
 </Button>
 <Button
 variant={viewMode === "gallery" ? "secondary" : "ghost"}
 size="sm"
 onClick={() => setViewMode("gallery")}
 className="h-7.5 gap-1.5 rounded-lg text-xs font-semibold px-3"
 >
 <LayoutGrid className="w-3.5 h-3.5" />
 <span>Gallery View</span>
 </Button>
 </div>

 <div className="flex items-center gap-2">
 {/* Save indicator in Split View Mode */}
 {viewMode === "split" && activeEntry && (
 <div className={cn(
 "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-medium transition-all duration-300",
 saveState === "saving" && "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse",
 saveState === "error" && "bg-rose-500/10 border-rose-500/30 text-rose-500",
 saveState === "saved" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
 saveState === "idle" && "bg-accent border-border text-muted-foreground"
 )}>
 {saveState === "saving" ? (
 <>
 <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
 <span>Saving...</span>
 </>
 ) : saveState === "error" ? (
 <>
 <AlertCircle className="h-3 w-3 text-rose-500" />
 <span>Failed to save</span>
 </>
 ) : saveState === "saved" ? (
 <>
 <CheckCircle2 className="h-3 w-3 text-emerald-500" />
 <span>Saved to Cloud</span>
 </>
 ) : (
 <>
 <CloudLightning className="h-3 w-3 text-muted-foreground/60" />
 <span>{savedLabel || "Draft"}</span>
 </>
 )}
 </div>
 )}

 {viewMode === "split" && activeEntry && (
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9 border border-border bg-background text-muted-foreground hover:text-foreground rounded-xl"
 onClick={() => setShareOpen(true)}
 title="Share entry"
 >
 <Share2 className="h-4 w-4" />
 </Button>
 )}

 {viewMode === "split" && (
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9 border border-border bg-background text-muted-foreground hover:text-foreground rounded-xl"
 onClick={() => setFocusMode((v) => !v)}
 title={focusMode ? "Exit focus" : "Focus mode"}
 >
 {focusMode ? (
 <Minimize2 className="h-4 w-4" />
 ) : (
 <Maximize2 className="h-4 w-4" />
 )}
 </Button>
 )}

 {viewMode === "split" && activeEntry && (
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9 border border-transparent hover:border-destructive/20 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-all"
 onClick={() => setConfirmDelete(true)}
 title="Delete entry"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 )}

 {viewMode === "gallery" && (
 <div className="flex items-center gap-2">
 <Button
 onClick={() => setRecorderOpen(true)}
 variant="outline"
 size="sm"
 className="h-9 gap-1.5 px-3.5 text-xs font-semibold rounded-xl border-2 hover:bg-accent"
 >
 <Mic className="h-4 w-4 text-primary" />
 <span>Record</span>
 </Button>
 <Button
 onClick={handleNewEntry}
 size="sm"
 className="h-9 gap-1.5 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95"
 >
 <PenLine className="h-4 w-4" />
 New Entry
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* Dynamic Panel Content */}
 <div className="flex-1 overflow-hidden flex flex-col min-h-0">
 {viewMode === "split" ? (
 /* Write Mode Split View Panel */
 activeEntry ? (
 <JournalEditor
 key={activeEntry.id}
 entry={activeEntry}
 onChange={handleEditorChange}
 onWordCountChange={setWordCount}
 focusMode={focusMode}
 tags={activeEntryTags}
 onTagsChange={handleTagsChange}
 emotion={activeEntryEmotion}
 />
 ) : (
 <EmptyState onCreate={handleNewEntry} creating={creating} />
 )
 ) : (
 /* Gallery Explore View Panel */
 <div className="flex-1 flex flex-col overflow-hidden bg-background min-h-0">
 
    {/* Mood & Tag Analytics Section */}
    <div className="px-6 py-4 border-b border-border bg-card/15 flex flex-col gap-4 select-none shrink-0">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mood Distribution</span>
          <span className="text-[10px] text-muted-foreground/60">{entries.length} reflections</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(emotionConfig).map(([mood, cfg]) => {
            const count = moodCounts[mood as keyof typeof moodCounts] ?? 0;
            const pct = entries.length ? Math.round((count / entries.length) * 100) : 0;
            const isSelected = selectedEmotion === mood;
            return (
              <button
                key={mood}
                onClick={() => setSelectedEmotion(isSelected ? "all" : mood)}
                className={cn(
                  "flex flex-col p-2.5 rounded-xl border-2 text-left transition-all active:scale-[0.98]",
                  isSelected
                    ? "bg-primary/5 border-primary text-foreground"
                    : "bg-background border-border text-muted-foreground hover:border-border/60 hover:bg-card/40"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">{cfg.label}</span>
                  <span className="text-[10px] text-muted-foreground/60 font-semibold">{count}</span>
                </div>
                <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", cfg.bgClass)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[9px] mt-1.5 font-bold text-muted-foreground/80">{pct}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {allUniqueTags.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Filter by Tags</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTag("all")}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border-2",
                selectedTag === "all"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border text-muted-foreground hover:border-border/60"
              )}
            >
              All Tags
            </button>
            {allUniqueTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? "all" : tag)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border-2",
                    isSelected
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground hover:border-border/60"
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>

 {/* Search, Filter and Sort Options bar */}
 <div className="px-6 py-3.5 border-b border-border bg-background flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
 <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg flex items-center gap-2">
 <div className="relative flex-1 group">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input
 type="text"
 placeholder={isAiSearch ? "Ask AI: 'doubtful moments' or 'village prep'..." : "Search journal entries..."}
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="h-10 pl-10 pr-9 text-xs rounded-xl border-2 border-border bg-card placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus:bg-card transition-all"
 />
 {search && (
 <button
 type="button"
 onClick={clearSearch}
 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 <Button
 type="button"
 variant={isAiSearch ? "secondary" : "outline"}
 onClick={() => setIsAiSearch((prev) => !prev)}
 className={cn(
 "h-10 px-3.5 rounded-xl text-xs font-bold shrink-0 border-2 border-border hover:bg-accent",
 isAiSearch ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15" : "bg-card text-muted-foreground"
 )}
 title="Toggle AI semantic search"
 >
 <Sparkles className="w-4 h-4 mr-1 text-primary" />
 <span>AI Search</span>
 </Button>
 
 <Button
 type="submit"
 disabled={isSearching}
 className="h-10 px-4.5 rounded-xl text-xs font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.98] transition-all shrink-0"
 >
 {isSearching ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 "Search"
 )}
 </Button>
 </form>

 {/* Dropdowns filters */}
 <div className="flex flex-wrap items-center gap-2.5">
 {/* Sort select */}
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value as any)}
 className="h-10 px-3 rounded-xl border-2 border-border bg-card text-xs font-semibold focus-visible:outline-none cursor-pointer hover:bg-accent/40"
 >
 <option value="date-desc">Newest First</option>
 <option value="date-asc">Oldest First</option>
 <option value="emotion">Sort by Emotion</option>
 <option value="length">Sort by Length</option>
 </select>

 {/* Emotion filter */}
 <select
 value={selectedEmotion}
 onChange={(e) => setSelectedEmotion(e.target.value)}
 className="h-10 px-3 rounded-xl border-2 border-border bg-card text-xs font-semibold focus-visible:outline-none cursor-pointer hover:bg-accent/40"
 >
 <option value="all">All Emotions</option>
 <option value="reflective">Reflective</option>
 <option value="excited">Excited</option>
 <option value="calm">Calm</option>
 <option value="anxious">Anxious</option>
 <option value="homesick">Homesick</option>
 <option value="motivated">Motivated</option>
 </select>

 {/* Tags filter */}
 {allUniqueTags.length > 0 && (
 <select
 value={selectedTag}
 onChange={(e) => setSelectedTag(e.target.value)}
 className="h-10 px-3 rounded-xl border-2 border-border bg-card text-xs font-semibold focus-visible:outline-none cursor-pointer hover:bg-accent/40"
 >
 <option value="all">All Tags</option>
 {allUniqueTags.map((tag) => (
 <option key={tag} value={tag}>
 #{tag}
 </option>
 ))}
 </select>
 )}
 </div>

 </div>

  {/* Search/Filter active banner */}
  {searchResults !== null && (
    <div className="px-6 py-2.5 bg-accent/25 border-b border-border text-xs flex items-center justify-between shrink-0 select-none">
      <span className="text-muted-foreground">
        Filtered by search query. Found <strong>{processedEntries.length}</strong> matching entries.
      </span>
      <Button variant="ghost" size="sm" onClick={clearSearch} className="h-7 px-2.5 text-xs text-primary font-bold">
        Clear search
      </Button>
    </div>
  )}

 {/* Grid Scroll Area */}
 <ScrollArea className="flex-1 h-full min-h-0 bg-background">
 <div className="p-6">
 {processedEntries.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 text-center">
 <BookOpen className="w-12 h-12 text-muted-foreground/30 stroke-[1.5] mb-3" />
 <h3 className="text-sm font-bold text-foreground">No journals found</h3>
 <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
 Try resetting your search query, emotion filter, or tags.
 </p>
 <Button variant="outline" className="mt-4 rounded-xl text-xs border-2" onClick={() => {
 clearSearch();
 setSelectedEmotion("all");
 setSelectedTag("all");
 }}>
 Reset all filters
 </Button>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {processedEntries.map((entry) => {
 const wordCount = getWordCount(entry.content);
 const emotion = getEntryEmotion(entry);
 const tags = getEntryTags(entry);

 return (
 <div
 key={entry.id}
 onClick={() => {
 setActiveEntryId(entry.id);
 setViewMode("split");
 }}
 className="group flex flex-col h-52 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-[0_2px_0_var(--border)] cursor-pointer transition-all duration-200 hover:scale-[1.01]"
 >
 <div className="flex items-start justify-between gap-3 mb-2.5">
 <div className="flex items-center gap-2 min-w-0 flex-1">
 {entry.type === "audio" ? (
 <Mic className="h-3.5 w-3.5 text-primary shrink-0" />
 ) : entry.type === "video" ? (
 <Video className="h-3.5 w-3.5 text-rose-500 shrink-0" />
 ) : (
 <FileText className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
 )}
 <h4 className="font-bold text-sm text-foreground truncate max-w-[155px] group-hover:text-primary transition-colors flex-1">
 {entry.title || "Untitled Entry"}
 </h4>
 </div>
 <span className="shrink-0 text-[10px] text-muted-foreground font-semibold">
 {formatRelative(entry.createdAt)}
 </span>
 </div>

 <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1 mb-3.5">
 {entry.preview || "Write your thoughts..."}
 </p>

 {/* Card Footer */}
 <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold pt-3 border-t border-border mt-auto select-none">
 <span className={cn("px-2 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-wide", emotion.color)}>
 {emotion.label}
 </span>

 {tags.slice(0, 3).map((tag) => (
 <span key={tag} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[8px] font-bold border border-border">
 #{tag}
 </span>
 ))}

  <div className="ml-auto flex items-center gap-2">
  <span className="text-muted-foreground/60 flex items-center gap-1">
  <Clock className="w-2.5 h-2.5" />
  {Math.max(1, Math.ceil(wordCount / 200))} min
  </span>
  <button
  type="button"
  onClick={(e) => {
  e.stopPropagation();
  setActiveEntryId(entry.id);
  setConfirmDelete(true);
  }}
  className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded hover:bg-destructive/10 transition-colors"
  title="Delete journal entry"
  >
  <Trash2 className="w-3 h-3" />
  </button>
  </div>
  </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </ScrollArea>

 </div>
 )}
 </div>

 {/* Footer info in Write Mode */}
 {viewMode === "split" && activeEntry && (
 <div
 className={cn(
 "flex items-center gap-4 border-t border-border bg-background px-6 py-2 text-[10px] text-muted-foreground tracking-wide select-none transition-all duration-300",
 focusMode && "opacity-20 hover:opacity-100",
 )}
 >
 <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
 <span>•</span>
 <span>{readingTime} min read</span>
 <span className="ml-auto font-medium">
 {saveState === "saving"
 ? "Saving..."
 : saveState === "error"
 ? "Unsaved changes detected"
 : savedLabel ? `Synced ${savedLabel.toLowerCase()}` : "Draft"}
 </span>
 </div>
 )}
 </main>

 <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
 <DialogContent className="border border-border bg-background text-foreground rounded-2xl max-w-sm">
 <DialogHeader>
 <DialogTitle className="text-base font-bold">Delete journal entry</DialogTitle>
 <DialogDescription className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
 This will permanently remove this entry from your private memory graph. This action cannot be undone.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="mt-4 gap-2">
 <Button
 variant="ghost"
 className="rounded-xl border border-border hover:bg-accent text-foreground text-xs h-9 px-4"
 onClick={() => setConfirmDelete(false)}
 >
 Cancel
 </Button>
 <Button
 variant="destructive"
 className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-9 px-4"
 onClick={handleDelete}
 >
 Delete
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <Dialog open={shareOpen} onOpenChange={setShareOpen}>
 <DialogContent className="border border-border bg-card text-foreground rounded-2xl max-w-md shadow-2xl">
 <DialogHeader>
 <DialogTitle className="text-base font-bold flex items-center gap-2">
 <Share2 className="w-4.5 h-4.5 text-primary" />
 <span>Share Journal Entry</span>
 </DialogTitle>
 <DialogDescription className="text-muted-foreground text-xs leading-relaxed mt-1">
 Configure visibility settings and sharing links for your private thoughts.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4 py-3">
 {/* Visibility Mode Selector */}
 <div className="space-y-1.5">
 <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
 Visibility
 </label>
 <div className="grid grid-cols-3 gap-2">
 {[
 {
 value: "normal",
 label: "Private",
 icon: LockIcon,
 desc: "Only you can see this",
 },
 {
 value: "unlisted",
 label: "Unlisted",
 icon: Link2,
 desc: "Anyone with link",
 },
 {
 value: "public",
 label: "Public",
 icon: Globe,
 desc: "Public to search engines",
 },
 ].map((option) => {
 const selected = sharePrivacy === option.value;
 const IconComp = option.icon;
 return (
 <button
 key={option.value}
 type="button"
 onClick={() => setSharePrivacy(option.value)}
 className={cn(
 "flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all active:scale-[0.98]",
 selected
 ? "bg-primary/5 border-primary text-foreground"
 : "bg-background border-border text-muted-foreground hover:border-border-hover"
 )}
 >
 <IconComp className={cn("w-4 h-4 mb-1.5", selected ? "text-primary" : "text-muted-foreground")} />
 <span className="text-xs font-bold">{option.label}</span>
 <span className="text-[9px] text-muted-foreground/80 mt-0.5 leading-snug line-clamp-1">{option.desc}</span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Custom URL Slug Editor */}
 {sharePrivacy !== "normal" && (
 <div className="space-y-1.5">
 <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
 Custom Link Slug
 </label>
 <div className="flex items-center gap-1.5">
 <span className="text-xs text-muted-foreground font-mono select-none">
 /j/
 </span>
 <Input
 type="text"
 value={shareSlug}
 onChange={(e) => setShareSlug(slugify(e.target.value))}
 placeholder="custom-slug-here"
 className="h-9 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary/20 text-xs"
 />
 </div>
 </div>
 )}

 {/* Share Link Preview & Copy */}
 {sharePrivacy !== "normal" && (
 <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-2">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
 Share Link
 </span>
 <Button
 variant="ghost"
 size="sm"
 className="h-7 text-[10px] font-bold gap-1 rounded-lg border border-border hover:bg-background"
 onClick={() => {
 const origin = typeof window !== "undefined" ? window.location.origin : "";
 const url = `${origin}/j/${shareSlug || activeEntry?.slug}`;
 navigator.clipboard.writeText(url);
 toast.success("Link copied to clipboard!");
 }}
 >
 <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
 Copy URL
 </Button>
 </div>
 <p className="text-xs text-primary font-mono select-all truncate">
 {typeof window !== "undefined" ? window.location.origin : ""}/j/{shareSlug || activeEntry?.slug}
 </p>
 </div>
 )}
 </div>

 <DialogFooter className="mt-2 gap-2">
 <Button
 variant="ghost"
 className="rounded-xl border border-border hover:bg-accent text-foreground text-xs h-9 px-4"
 onClick={() => setShareOpen(false)}
 >
 Cancel
 </Button>
 <Button
 className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold h-9 px-4 shadow-[0_3px_0_#46A302] active:translate-y-[2px] active:shadow-none transition-all"
 onClick={() => handleShareSave(sharePrivacy, shareSlug)}
 >
 Save changes
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <JournalRecorderDialog
 open={recorderOpen}
 onOpenChange={setRecorderOpen}
 onSuccess={() => mutate()}
 />
 </div>
 );
}

function EmptyState({
 onCreate,
 creating,
}: {
 onCreate: () => void;
 creating: boolean;
}) {
 return (
 <div className="flex h-full items-center justify-center px-6 bg-background">
 <div className="max-w-md text-center">
 <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent border border-border text-foreground shadow-sm">
 <PenLine className="h-6 w-6 text-foreground/80" />
 </div>
 <h2 className="text-xl font-bold text-foreground tracking-tight">
 A blank page is waiting
 </h2>
 <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
 Capture a thought, log the day, or reflect on a decision. Press{" "}
 <kbd className="rounded border border-border bg-accent px-2 py-0.5 text-[10px] text-foreground font-mono shadow-sm">
 n
 </kbd>{" "}
 anytime to start.
 </p>
 <Button
 onClick={onCreate}
 className="mt-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs px-5 h-10 shadow-sm active:scale-[0.98] transition-all"
 disabled={creating}
 >
 {creating ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
 Opening journal...
 </>
 ) : (
 <>
 <PenLine className="mr-2 h-4 w-4" />
 Start Writing
 </>
 )}
 </Button>
 </div>
 </div>
 );
}

function JournalRecorderDialog({
 open,
 onOpenChange,
 onSuccess,
}: {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 onSuccess: () => void;
}) {
 const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");
 const [recordingState, setRecordingState] = useState<"idle" | "recording" | "preview" | "saving">("idle");
 const [stream, setStream] = useState<MediaStream | null>(null);
 const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
 const [chunks, setChunks] = useState<Blob[]>([]);
 const [duration, setDuration] = useState(0);
 const [previewUrl, setPreviewUrl] = useState<string | null>(null);
 const [isUploading, setIsUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState("");

 const videoRef = useRef<HTMLVideoElement | null>(null);
 const timerRef = useRef<any>(null);

 useEffect(() => {
 if (!open) {
 cleanup();
 }
 return () => cleanup();
 }, [open]);

 const cleanup = () => {
 if (timerRef.current) clearInterval(timerRef.current);
 if (stream) {
 stream.getTracks().forEach((track) => track.stop());
 }
 setStream(null);
 setRecorder(null);
 setChunks([]);
 setDuration(0);
 setRecordingState("idle");
 if (previewUrl) {
 URL.revokeObjectURL(previewUrl);
 setPreviewUrl(null);
 }
 setIsUploading(false);
 setUploadProgress("");
 };

 const startRecording = async () => {
 try {
 cleanup();
 const constraints: MediaStreamConstraints = activeTab === "video"
 ? { audio: true, video: { facingMode: "user", width: 640, height: 480 } }
 : { audio: true, video: false };

 const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
 setStream(mediaStream);

 if (activeTab === "video" && videoRef.current) {
 videoRef.current.srcObject = mediaStream;
 videoRef.current.muted = true;
 videoRef.current.play().catch((e) => console.error("Video play failed:", e));
 }

 const options = { mimeType: activeTab === "video" ? "video/webm;codecs=vp9,opus" : "audio/webm;codecs=opus" };
 let mediaRecorder: MediaRecorder;
 try {
 mediaRecorder = new MediaRecorder(mediaStream, options);
 } catch (e) {
 mediaRecorder = new MediaRecorder(mediaStream);
 }

 const localChunks: Blob[] = [];
 mediaRecorder.ondataavailable = (e) => {
 if (e.data && e.data.size > 0) {
 localChunks.push(e.data);
 }
 };

 mediaRecorder.onstop = () => {
 const mimeType = activeTab === "video" ? "video/webm" : "audio/webm";
 const blob = new Blob(localChunks, { type: mimeType });
 const url = URL.createObjectURL(blob);
 setPreviewUrl(url);
 setChunks(localChunks);
 setRecordingState("preview");

 mediaStream.getTracks().forEach((track) => track.stop());
 };

 mediaRecorder.start(1000);
 setRecorder(mediaRecorder);
 setRecordingState("recording");

 setDuration(0);
 timerRef.current = setInterval(() => {
 setDuration((prev) => prev + 1);
 }, 1000);

 } catch (err: any) {
 console.error("Failed to start recording:", err);
 toast.error(err.message || "Microphone/Camera permission denied.");
 cleanup();
 }
 };

 const stopRecording = () => {
 if (recorder && recorder.state !== "inactive") {
 recorder.stop();
 }
 if (timerRef.current) {
 clearInterval(timerRef.current);
 }
 };

 const saveRecording = async () => {
 if (chunks.length === 0) return;
 setIsUploading(true);
 setUploadProgress("Compressing media file...");

 try {
 const extension = "webm";
 const mimeType = activeTab === "video" ? "video/webm" : "audio/webm";
 const blob = new Blob(chunks, { type: mimeType });
 const filename = `${activeTab === "video" ? "Video" : "Audio"}_Journal_${new Date().toISOString().slice(0, 10)}.${extension}`;
 const file = new File([blob], filename, { type: mimeType });

 setUploadProgress("Uploading file to private storage...");
 await api.media.upload(file, activeTab);
 toast.success(`${activeTab === "video" ? "Video" : "Audio"} journal saved successfully! Transcription starting in the background.`);

 onSuccess();
 onOpenChange(false);
 } catch (err: any) {
 console.error("Upload failed:", err);
 toast.error("Failed to upload recording: " + (err.message || "Unknown error"));
 } finally {
 setIsUploading(false);
 }
 };

 const formatTime = (secs: number) => {
 const mins = Math.floor(secs / 60);
 const remaining = secs % 60;
 return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
 };

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="border border-border bg-card text-foreground rounded-2xl max-w-lg shadow-2xl overflow-hidden p-0">
 <DialogHeader className="p-6 pb-2">
 <DialogTitle className="text-base font-bold flex items-center gap-2">
 <SlidersHorizontal className="w-4 h-4 text-primary animate-pulse" />
 <span>Record Memory Journal</span>
 </DialogTitle>
 <DialogDescription className="text-muted-foreground text-xs">
 Capture a live voice recording or webcam video reflection. It will be stored in your private vault and transcribed by AI.
 </DialogDescription>
 </DialogHeader>

 {recordingState === "idle" && (
 <div className="flex px-6 mb-4 gap-2">
 <button
 onClick={() => setActiveTab("audio")}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all active:scale-[0.98]",
 activeTab === "audio" ? "bg-primary/10 border-primary/30 text-primary" : "bg-background border-border text-muted-foreground hover:bg-secondary"
 )}
 >
 <Mic className="w-4 h-4" />
 Audio Journal
 </button>
 <button
 onClick={() => setActiveTab("video")}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all active:scale-[0.98]",
 activeTab === "video" ? "bg-primary/10 border-primary/30 text-primary" : "bg-background border-border text-muted-foreground hover:bg-secondary"
 )}
 >
 <Video className="w-4 h-4" />
 Video Journal
 </button>
 </div>
 )}

 <div className="px-6 py-4 flex flex-col items-center justify-center bg-muted/20 border-y border-border min-h-[260px] relative">
 
 {recordingState === "idle" && (
 <div className="flex flex-col items-center justify-center text-center py-6">
 <div className="w-16 h-16 rounded-full bg-accent border border-border flex items-center justify-center mb-4">
 {activeTab === "audio" ? <Mic className="w-8 h-8 text-primary" /> : <Video className="w-8 h-8 text-rose-500" />}
 </div>
 <p className="text-xs font-bold text-foreground">Ready to Record</p>
 <p className="text-[11px] text-muted-foreground mt-1 max-w-[250px] leading-relaxed">
 Click start to begin capturing. Make sure your browser has permissions for the {activeTab === "audio" ? "microphone" : "camera & microphone"}.
 </p>
 </div>
 )}

 {recordingState === "recording" && (
 <div className="w-full flex flex-col items-center justify-center">
 {activeTab === "video" ? (
 <div className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-border relative mb-4">
 <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
 <div className="absolute top-3 left-3 bg-rose-500/80 backdrop-blur text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
 <span className="w-2 h-2 rounded-full bg-white" />
 Live Recording
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center py-8">
 <div className="flex items-end justify-center gap-1.5 h-16 mb-4">
 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
 const delays = ["delay-100", "delay-200", "delay-300", "delay-500", "delay-700"];
 const delayClass = delays[bar % delays.length];
 return (
 <div
 key={bar}
 className={cn(
 "w-1.5 bg-primary/75 rounded-full animate-bounce shrink-0",
 delayClass
 )}
 style={{
 height: `${20 + Math.sin(bar) * 15}px`,
 animationDuration: `${0.4 + Math.sin(bar) * 0.4}s`
 }}
 />
 );
 })}
 </div>
 <p className="text-[11px] text-primary/80 uppercase tracking-widest font-extrabold animate-pulse">Recording Audio...</p>
 </div>
 )}

 <div className="text-xl font-bold font-mono tracking-wider text-foreground mb-4">
 {formatTime(duration)}
 </div>
 </div>
 )}

 {recordingState === "preview" && previewUrl && (
 <div className="w-full flex flex-col items-center justify-center">
 {activeTab === "video" ? (
 <video src={previewUrl} controls className="w-full aspect-video rounded-xl border border-border object-cover mb-4" />
 ) : (
 <div className="w-full py-6 flex flex-col items-center justify-center">
 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
 <Mic className="w-5 h-5 text-primary" />
 </div>
 <audio src={previewUrl} controls className="w-full max-w-sm mb-4" />
 </div>
 )}
 <p className="text-xs font-bold text-foreground">Review Recording</p>
 <p className="text-[11px] text-muted-foreground mt-1 max-w-[250px] leading-relaxed text-center">
 Listen or watch your recorded journal. If you are satisfied, save it to add it to your private memories.
 </p>
 </div>
 )}

 {isUploading && (
 <div className="absolute inset-0 bg-card/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
 <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
 <p className="text-sm font-bold text-foreground">Processing Journal Entry</p>
 <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
 {uploadProgress}
 </p>
 </div>
 )}

 </div>

 <div className="p-6 flex items-center justify-end gap-2 bg-background">
 <Button
 variant="ghost"
 className="rounded-xl border border-border hover:bg-accent text-foreground text-xs h-9 px-4"
 onClick={() => onOpenChange(false)}
 disabled={isUploading}
 >
 Cancel
 </Button>

 {recordingState === "idle" && (
 <Button
 className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold h-9 px-4 shadow-[0_3px_0_#46A302] active:translate-y-[2px] active:shadow-none transition-all"
 onClick={startRecording}
 >
 Start Recording
 </Button>
 )}

 {recordingState === "recording" && (
 <Button
 variant="destructive"
 className="rounded-xl bg-destructive hover:bg-destructive/95 text-destructive-foreground text-xs font-bold h-9 px-4 shadow-[0_3px_0_#A30202] active:translate-y-[2px] active:shadow-none transition-all"
 onClick={stopRecording}
 >
 Stop Recording
 </Button>
 )}

 {recordingState === "preview" && (
 <>
 <Button
 variant="outline"
 className="rounded-xl border-2 border-border text-foreground text-xs h-9 px-4 hover:bg-accent"
 onClick={() => setRecordingState("idle")}
 disabled={isUploading}
 >
 Re-record
 </Button>
 <Button
 className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold h-9 px-4 shadow-[0_3px_0_#46A302] active:translate-y-[2px] active:shadow-none transition-all"
 onClick={saveRecording}
 disabled={isUploading}
 >
 Save as Journal
 </Button>
 </>
 )}
 </div>
 </DialogContent>
 </Dialog>
 );
}
