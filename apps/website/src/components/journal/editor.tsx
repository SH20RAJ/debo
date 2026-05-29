"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
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
      // BlockNote returns unsubscribe in newer versions; older returns void
      if (typeof unsubscribe === "function") unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, title]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onChange({ title: value, content: blocksToPlainText(editor.document) });
  };

  const dateLabel = useMemo(() => {
    const d = new Date(entry.createdAt);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [entry.createdAt]);

  // suppress unused-warning when wordCount only feeds the parent
  void wordCount;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div
          className={
            focusMode
              ? "mx-auto max-w-2xl px-6 py-16 sm:px-10"
              : "mx-auto max-w-2xl px-6 py-10 sm:px-10"
          }
        >
          <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            {dateLabel}
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-6 w-full border-none bg-transparent text-3xl font-semibold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40 sm:text-4xl"
            aria-label="Entry title"
          />
          <div className="journal-blocknote">
            <BlockNoteView
              editor={editor}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              className="min-h-[60vh]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
