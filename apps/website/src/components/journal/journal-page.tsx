"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
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

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Draft";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  // UI Modes
  const [viewMode, setViewMode] = useState<"split" | "gallery">("split");
  const [creating, setCreating] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

      mutate(
        (prev) => prev?.map((e) => (e.id === targetId ? mapped : e)) ?? [],
        false
      );

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

      // Optimistic list preview sync
      mutate(
        (prev) =>
          prev?.map((e) =>
            e.id === activeEntryId
              ? {
                  ...e,
                  title,
                  content,
                  preview: makePreview(content),
                  updatedAt: new Date().toISOString(),
                }
              : e
          ) ?? [],
        false
      );

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

      mutate(
        (prev) =>
          prev?.map((e) =>
            e.id === activeEntryId
              ? {
                  ...e,
                  metadataJson: metadataStr,
                  updatedAt: new Date().toISOString(),
                }
              : e
          ) ?? [],
        false
      );

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
      
      mutate(
        (prev) => prev?.map((e) => (e.id === tempId ? mapped : e)) ?? [mapped],
        false
      );
      setActiveEntryId(mapped.id);
    } catch (err) {
      console.error("[journal] create failed", err);
      mutate((prev) => prev?.filter((e) => e.id !== tempId) ?? [], false);
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

  const activeEntryTags = useMemo(() => {
    return activeEntry ? getEntryTags(activeEntry) : [];
  }, [activeEntry]);

  const activeEntryEmotion = useMemo(() => {
    return activeEntry ? getEntryEmotion(activeEntry) : { label: "Reflective", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" };
  }, [activeEntry]);

  const savedLabel = useRelativeSavedLabel(savedAt);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex h-full overflow-hidden bg-background text-foreground">
      
      {/* Sidebar - only shown in Split View Mode */}
      {viewMode === "split" && !focusMode && (
        <aside className="hidden w-[280px] shrink-0 border-r border-border bg-card md:flex md:flex-col transition-all duration-300">
          <JournalEntryList
            entries={entries}
            activeEntryId={activeEntryId}
            onSelect={setActiveEntryId}
            onNewEntry={handleNewEntry}
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
              <Button
                onClick={handleNewEntry}
                size="sm"
                className="h-9 gap-1.5 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <PenLine className="h-4 w-4" />
                New Entry
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Panel Content */}
        <div className="flex-1 overflow-hidden">
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
            <div className="h-full flex flex-col overflow-hidden bg-background">
              
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

              {/* Grid Scroll Area */}
              <ScrollArea className="flex-1 bg-background">
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
                              <h4 className="font-bold text-sm text-foreground truncate max-w-[155px] group-hover:text-primary transition-colors">
                                {entry.title || "Untitled Entry"}
                              </h4>
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

                              <span className="ml-auto text-muted-foreground/60 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {Math.max(1, Math.ceil(wordCount / 200))} min
                              </span>
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
            <DialogTitle className="text-base font-bold font-[var(--font-nunito)]">Delete journal entry</DialogTitle>
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
        <h2 className="text-xl font-bold text-foreground tracking-tight font-[var(--font-nunito)]">
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
