"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { Calendar } from "lucide-react";
import type { JournalEntry } from "./journal-page";

interface JournalEditorProps {
  entry: JournalEntry;
  onChange: (data: { title: string; content: string }) => void;
  onWordCountChange?: (count: number) => void;
  focusMode?: boolean;
}

function plainTextToBlocks(text: string) {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return [{ type: "paragraph" as const, content: "" }];
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => ({
      type: "paragraph" as const,
      content: paragraph.trim(),
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
}: JournalEditorProps) {
  const { resolvedTheme } = useTheme();
  const [title, setTitle] = useState(entry.title);
  const [wordCount, setWordCount] = useState(0);
  const lastEntryIdRef = useRef(entry.id);

  const editor = useCreateBlockNote({
    initialContent: plainTextToBlocks(entry.content),
  });

  // When the active entry switches, replace editor content and reset title.
  useEffect(() => {
    if (lastEntryIdRef.current === entry.id) return;
    lastEntryIdRef.current = entry.id;
    setTitle(entry.title);
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

  // Subscribe to editor changes -> propagate up.
  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      const content = blocksToPlainText(editor.document);
      onChange({ title, content });
      recomputeWordCount();
    });
    // initial measurement
    recomputeWordCount();
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [editor, title, onChange, recomputeWordCount]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onChange({ title: value, content: blocksToPlainText(editor.document) });
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

  // suppress unused-warning
  void wordCount;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div
          className={
            focusMode
              ? "mx-auto max-w-2xl px-6 py-16 sm:px-10 transition-all duration-500 ease-in-out"
              : "mx-auto max-w-2xl px-6 py-10 sm:px-10 transition-all duration-500 ease-in-out"
          }
        >
          {/* Calendar Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-xl border border-zinc-800/40 bg-zinc-900/10 text-[10px] font-bold uppercase tracking-wider text-zinc-450 select-none">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>{dateLabel}</span>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note"
            className="mb-8 w-full border-none bg-transparent text-3xl font-extrabold leading-tight tracking-tight text-zinc-100 outline-none placeholder:text-zinc-800 sm:text-4xl font-[var(--font-nunito)] transition-all focus:placeholder:text-zinc-700"
            aria-label="Entry title"
          />

          {/* BlockNote Editor Wrapper */}
          <div className="journal-blocknote prose prose-zinc dark:prose-invert max-w-none font-sans text-zinc-300">
            <BlockNoteView
              editor={editor}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              className="min-h-[55vh] -mx-[46px]" // Align the text perfectly with the title input
            />
          </div>
        </div>
      </div>
    </div>
  );
}
