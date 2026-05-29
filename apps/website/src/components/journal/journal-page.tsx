"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  Maximize2,
  Menu,
  Minimize2,
  PenLine,
  Trash2,
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
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading editor
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

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntryId, setActiveEntryId] = useState<string>("");
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

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.journal.list();
      const mapped = (Array.isArray(data) ? data : []).map(mapSourceToEntry);
      setEntries(mapped);
      setActiveEntryId((prev) => {
        if (prev && mapped.some((e) => e.id === prev)) return prev;
        return mapped[0]?.id ?? "";
      });
    } catch (err) {
      console.error("[journal] failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

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
  }, [activeEntry?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setSaveState("saving");
    try {
      const updated = await api.journal.update(targetId, {
        title: draft.title,
        content: draft.content,
      });
      lastSavedRef.current = {
        id: targetId,
        title: draft.title,
        content: draft.content,
      };
      setEntries((prev) =>
        prev.map((e) =>
          e.id === targetId
            ? {
                ...e,
                title: draft.title,
                content: draft.content,
                preview: makePreview(draft.content),
                updatedAt:
                  updated?.updatedAt ?? new Date().toISOString(),
              }
            : e,
        ),
      );
      setSavedAt(Date.now());
      setSaveState("saved");
    } catch (err) {
      console.error("[journal] save failed", err);
      setSaveState("error");
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      flushSave();
    }, 800);
  }, [flushSave]);

  // Flush on unmount or before tab close.
  useEffect(() => {
    const onBeforeUnload = () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // best-effort fire-and-forget
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
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleNewEntry = useCallback(async () => {
    if (creating) return;
    // flush any pending changes for current entry first
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await flushSave();
    setCreating(true);
    try {
      const created = await api.journal.create({ title: "", content: "" });
      const entry = mapSourceToEntry(created);
      setEntries((prev) => [entry, ...prev]);
      setActiveEntryId(entry.id);
      setListOpen(false);
    } catch (err) {
      console.error("[journal] create failed", err);
    } finally {
      setCreating(false);
    }
  }, [creating, flushSave]);

  const handleDelete = useCallback(async () => {
    if (!activeEntry) return;
    const id = activeEntry.id;
    setConfirmDelete(false);
    try {
      await api.sources.delete(id);
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        setActiveEntryId(next[0]?.id ?? "");
        return next;
      });
    } catch (err) {
      console.error("[journal] delete failed", err);
    }
  }, [activeEntry]);

  // Keyboard: "n" creates a new entry (ignore if focus is on input/editor).
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
    <div className="flex h-full overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      {!focusMode && (
        <aside className="hidden w-[260px] shrink-0 border-r border-border bg-card md:flex md:flex-col">
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
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setListOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[80vw] max-w-[320px] border-r border-border bg-card shadow-lg">
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

      {/* Main */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2",
            focusMode && "opacity-40 transition-opacity hover:opacity-100",
          )}
        >
          {!focusMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={() => setListOpen(true)}
              aria-label="Open entries"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1">
            <span
              className={cn(
                "mr-2 hidden text-xs text-muted-foreground sm:inline",
                saveState === "error" && "text-destructive",
              )}
              aria-live="polite"
            >
              {!activeEntry
                ? ""
                : saveState === "saving"
                  ? "Saving"
                  : saveState === "error"
                    ? "Save failed"
                    : savedLabel || (activeEntry.content || activeEntry.title ? "Saved" : "")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setFocusMode((v) => !v)}
              aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
              title={focusMode ? "Exit focus mode" : "Focus mode"}
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
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete entry"
                title="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : activeEntry ? (
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

        {/* Status bar */}
        {activeEntry && (
          <div
            className={cn(
              "flex items-center gap-4 border-t border-border bg-card/50 px-4 py-1.5 text-[11px] text-muted-foreground",
              focusMode && "opacity-40 transition-opacity hover:opacity-100",
            )}
          >
            <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
            <span>{readingTime} min read</span>
            <span className="ml-auto sm:hidden">
              {saveState === "saving"
                ? "Saving"
                : saveState === "error"
                  ? "Save failed"
                  : savedLabel}
            </span>
          </div>
        )}
      </main>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this entry</DialogTitle>
            <DialogDescription>
              This will permanently remove the entry from your journal. This
              action can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
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
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <PenLine className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          A blank page is waiting
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Capture a thought, log the day, or work through a decision. Press{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            n
          </kbd>{" "}
          anytime to start a new entry.
        </p>
        <Button onClick={onCreate} className="mt-5" disabled={creating}>
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PenLine className="mr-2 h-4 w-4" />
          )}
          Start writing
        </Button>
      </div>
    </div>
  );
}
