"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2, Video, X } from "lucide-react";
import { JournalEntryList } from "@/components/journal/entry-list";
import { JournalInsightRail } from "@/components/journal/insight-rail";
import { TemplatePicker } from "@/components/journal/template-picker";
import { VideoCapture } from "@/components/journal/video-capture";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const JournalEditor = dynamic(
  () => import("@/components/journal/editor").then((m) => m.JournalEditor),
  { ssr: false, loading: () => <div className="p-8 text-muted-foreground">Loading editor...</div> }
);

export interface JournalEntry {
  id: string;
  title: string;
  preview: string;
  date: string;
  content: string;
  people: string[];
  tasks: string[];
  createdAt?: string;
  type?: string;
  status?: string;
}

function makePreview(content: string): string {
  const text = content.replace(/[#*_~`>\[\]()!-]/g, "").trim();
  return text.length > 120 ? text.slice(0, 120) + "..." : text || "Empty entry";
}

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntryId, setActiveEntryId] = useState<string>("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showVideoCapture, setShowVideoCapture] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch entries on mount
  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.journal.list();
      const mapped: JournalEntry[] = (Array.isArray(data) ? data : []).map((s: any) => ({
        id: s.id,
        title: s.title ?? "Untitled",
        preview: makePreview(s.content ?? ""),
        date: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content: s.content ?? "",
        people: s.people ?? [],
        tasks: s.tasks ?? [],
        createdAt: s.createdAt,
        type: s.type,
        status: s.status,
      }));
      setEntries(mapped);
      if (mapped.length > 0 && !activeEntryId) {
        setActiveEntryId(mapped[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch journal entries:", err);
    } finally {
      setLoading(false);
    }
  }, [activeEntryId]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const activeEntry = entries.find((e) => e.id === activeEntryId) ?? entries[0];

  const handleNewEntry = () => {
    setShowTemplatePicker(true);
  };

  const handleSelectTemplate = async (title: string, content: string) => {
    setShowTemplatePicker(false);
    setSaving(true);
    try {
      const result = await api.journal.create({ title, content });
      const newEntry: JournalEntry = {
        id: result.id,
        title: result.title ?? title,
        preview: makePreview(content),
        date: new Date(result.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content,
        people: [],
        tasks: [],
        createdAt: result.createdAt,
        type: "journal",
        status: "draft",
      };
      setEntries((prev) => [newEntry, ...prev]);
      setActiveEntryId(newEntry.id);
    } catch (err) {
      console.error("Failed to create entry:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (entryId: string, data: { title?: string; content?: string }) => {
    setSaving(true);
    try {
      await api.journal.update(entryId, data);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                title: data.title ?? e.title,
                content: data.content ?? e.content,
                preview: makePreview(data.content ?? e.content),
              }
            : e
        )
      );
    } catch (err) {
      console.error("Failed to save entry:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoTranscript = (transcript: string, sourceId: string) => {
    // Refresh entries to pick up the new video source
    fetchEntries();
    setShowVideoCapture(false);
    if (sourceId) setActiveEntryId(sourceId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Entry list */}
      <aside className="w-[250px] shrink-0 border-r border-border bg-card hidden md:block">
        <JournalEntryList
          entries={entries}
          activeEntryId={activeEntryId}
          onSelect={setActiveEntryId}
          onNewEntry={handleNewEntry}
        />
      </aside>

      {/* Center: Editor */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
        {/* Video capture bar */}
        <div className="border-b border-border px-4 py-2 flex items-center gap-2">
          {showVideoCapture ? (
            <div className="flex-1 flex items-center gap-3">
              <VideoCapture onTranscriptReady={handleVideoTranscript} />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0"
                onClick={() => setShowVideoCapture(false)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={() => setShowVideoCapture(true)}
            >
              <Video className="w-3.5 h-3.5" />
              Record video
            </Button>
          )}
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
        </div>

        {activeEntry ? (
          <JournalEditor entry={activeEntry} onSave={handleSave} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No entries yet. Create one to get started.
          </div>
        )}
      </main>

      {/* Right: Insight rail */}
      {activeEntry && (
        <aside className="w-[280px] shrink-0 border-l border-border bg-card overflow-y-auto hidden lg:block">
          <JournalInsightRail entry={activeEntry} />
        </aside>
      )}

      {/* Template picker dialog */}
      <TemplatePicker
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
