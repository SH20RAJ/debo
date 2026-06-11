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
} from "lucide-react";
import { JournalEntryList } from "@/components/journal/entry-list";
import { Button } from "@/components/ui/button";
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

const JournalEditor = dynamic(
  () => import("@/components/journal/editor").then((m) => m.JournalEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
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
  };
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
  // SWR Hook with initial server fallback data
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

  const [creating, setCreating] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const draftRef = useRef<{ title: string; content: string } | null>(null);
  const lastSavedRef = useRef<{
    id: string;
    title: string;
    content: string;
  } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select first entry if active selection is invalid/empty
  useEffect(() => {
    if (entries.length > 0 && (!activeEntryId || !entries.some(e => e.id === activeEntryId))) {
      setActiveEntryId(entries[0].id);
    }
  }, [entries, activeEntryId]);

  const activeEntry = useMemo(
    () => entries.find((e) => e.id === activeEntryId),
    [entries, activeEntryId],
  );

  // Reset draft tracking whenever active entry changes.
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
    };
    lastSavedRef.current = {
      id: activeEntry.id,
      title: activeEntry.title,
      content: activeEntry.content,
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
      draft.content === last.content
    ) {
      return;
    }
    const targetId = last.id;
    if (targetId.startsWith("temp_")) {
      return; // Skip saving until real ID is resolved from server
    }

    setSaveState("saving");
    try {
      const updated = await api.journal.update(targetId, {
        title: draft.title,
        content: draft.content,
      });
      
      const mapped = mapSourceToEntry(updated);
      lastSavedRef.current = {
        id: targetId,
        title: draft.title,
        content: draft.content,
      };

      // Update local SWR cache with the newly updated entry
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

  // Flush on unmount or before tab close.
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
      draftRef.current = { title, content };

      // Optimistic cache update for fast UI response
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
    [activeEntryId, mutate, scheduleSave],
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

    // Optimistically prepend the temp entry to list and focus it
    mutate([tempEntry, ...entries], false);
    setActiveEntryId(tempId);
    setListOpen(false);

    try {
      const created = await api.journal.create({ title: "", content: "" });
      const mapped = mapSourceToEntry(created);
      
      // Replace temp entry with the real entry
      mutate(
        (prev) => prev?.map((e) => (e.id === tempId ? mapped : e)) ?? [mapped],
        false
      );
      setActiveEntryId(mapped.id);
    } catch (err) {
      console.error("[journal] create failed", err);
      // Remove temp entry from list
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

    // Optimistic UI delete
    mutate(entries.filter((e) => e.id !== id), false);
    setActiveEntryId(nextActiveId);

    try {
      await api.sources.delete(id);
    } catch (err) {
      console.error("[journal] delete failed", err);
      // Rollback to original list
      mutate(oldEntries, false);
      setActiveEntryId(id);
    }
  }, [activeEntry, entries, mutate]);

  // Keyboard: "n" creates a new entry
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName?.toLowerCase();
      const editable =
        tag === "input" ||
        tag === "textarea" ||
        target.isContentEditable;
      if (editable) return;
      e.preventDefault();
      handleNewEntry();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewEntry]);

  const savedLabel = useRelativeSavedLabel(savedAt);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex h-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar — desktop */}
      {!focusMode && (
        <aside className="hidden w-[280px] shrink-0 border-r border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl md:flex md:flex-col transition-all duration-300">
          <JournalEntryList
            entries={entries}
            activeEntryId={activeEntryId}
            onSelect={setActiveEntryId}
            onNewEntry={handleNewEntry}
          />
        </aside>
      )}

      {/* Sidebar — mobile sheet */}
      {listOpen && !focusMode && (
        <div className="fixed inset-0 z-40 md:hidden transition-all duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setListOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[80vw] max-w-[320px] border-r border-zinc-800 bg-zinc-900 shadow-2xl">
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
      <main className="relative flex min-w-0 flex-1 flex-col bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
        {/* Top bar */}
        <div
          className={cn(
            "flex items-center gap-2 px-6 py-3 border-b border-zinc-800/30 bg-zinc-950/40 backdrop-blur-xl z-10 select-none transition-all duration-300",
            focusMode && "opacity-20 hover:opacity-100",
          )}
        >
          {!focusMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
              onClick={() => setListOpen(true)}
              aria-label="Open entries"
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          )}

          <div className="flex items-center gap-3">
            {activeEntry && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300 max-w-[150px] truncate">
                  {activeEntry.title || "Untitled Entry"}
                </span>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {activeEntry && (
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-medium transition-all duration-300",
                saveState === "saving" && "bg-amber-950/20 border-amber-800/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]",
                saveState === "error" && "bg-rose-950/20 border-rose-800/50 text-rose-300 animate-pulse",
                saveState === "saved" && "bg-emerald-950/20 border-emerald-800/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
                saveState === "idle" && "bg-zinc-900/40 border-zinc-800/80 text-zinc-400"
              )}>
                {saveState === "saving" && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                    <span>Saving...</span>
                  </>
                )}
                {saveState === "error" && (
                  <>
                    <AlertCircle className="h-3 w-3 text-rose-400" />
                    <span>Failed to save</span>
                  </>
                )}
                {saveState === "saved" && (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Saved to Cloud</span>
                  </>
                )}
                {saveState === "idle" && (
                  <>
                    <CloudLightning className="h-3 w-3 text-zinc-500" />
                    <span>{savedLabel || "Draft"}</span>
                  </>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 border border-zinc-850 hover:border-zinc-700/60 bg-zinc-900/30 hover:bg-zinc-800/50 text-zinc-450 hover:text-zinc-100 rounded-xl transition-all"
              onClick={() => setFocusMode((v) => !v)}
              aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
              title={focusMode ? "Exit focus" : "Focus mode"}
            >
              {focusMode ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {activeEntry && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border border-transparent hover:border-rose-900/40 hover:bg-rose-950/20 text-zinc-450 hover:text-rose-400 rounded-xl transition-all"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete entry"
                title="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {activeEntry ? (
            <JournalEditor
              key={activeEntry.id}
              entry={activeEntry}
              onChange={handleEditorChange}
              onWordCountChange={setWordCount}
              focusMode={focusMode}
            />
          ) : (
            <EmptyState onCreate={handleNewEntry} creating={creating} />
          )}
        </div>

        {/* Status bar */}
        {activeEntry && (
          <div
            className={cn(
              "flex items-center gap-4 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-2 text-[10px] text-zinc-500 tracking-wide select-none transition-all duration-300",
              focusMode && "opacity-20 hover:opacity-100",
            )}
          >
            <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
            <span className="ml-auto">
              {saveState === "saving"
                ? "Saving in background..."
                : saveState === "error"
                  ? "Unsaved changes detected"
                  : savedLabel ? `Last synced ${savedLabel.toLowerCase()}` : "Not saved yet"}
            </span>
          </div>
        )}
      </main>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="border border-zinc-800 bg-zinc-950 text-zinc-150 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-base font-bold font-[var(--font-nunito)]">Delete journal entry</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              This will permanently remove this entry from your private memory graph. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              className="rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs h-9 px-4"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4"
              onClick={handleDelete}
            >
              Delete Permanently
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
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-primary shadow-lg shadow-black/50">
          <PenLine className="h-6 w-6 text-zinc-200" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight font-[var(--font-nunito)]">
          A blank page is waiting
        </h2>
        <p className="mt-2 text-sm text-zinc-450 leading-relaxed max-w-xs mx-auto">
          Capture a thought, log the day, or reflect on a decision. Press{" "}
          <kbd className="rounded border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-300 font-mono shadow-sm">
            n
          </kbd>{" "}
          anytime to start.
        </p>
        <Button
          onClick={onCreate}
          className="mt-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-5 h-10 shadow-md shadow-white/5 active:scale-[0.98] transition-all"
          disabled={creating}
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
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
