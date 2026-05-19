"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "./journal-page";

interface JournalEditorProps {
  entry: JournalEntry;
  onSave?: (entryId: string, data: { title?: string; content?: string }) => void;
}

export function JournalEditor({ entry, onSave }: JournalEditorProps) {
  const [title, setTitle] = useState(entry.title);
  const { resolvedTheme } = useTheme();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ title: entry.title, entryId: entry.id });

  const editor = useCreateBlockNote({
    initialContent: entry.content
      ? entry.content
          .split("\n\n")
          .filter(Boolean)
          .map((paragraph) => ({
            type: "paragraph" as const,
            content: paragraph.trim(),
          }))
      : [{ type: "paragraph" as const, content: "" }],
  });

  // Reset editor when entry changes
  useEffect(() => {
    setTitle(entry.title);
    lastSavedRef.current = { title: entry.title, entryId: entry.id };

    // Replace editor content
    const blocks = entry.content
      ? entry.content
          .split("\n\n")
          .filter(Boolean)
          .map((paragraph) => ({
            type: "paragraph" as const,
            content: paragraph.trim(),
          }))
      : [{ type: "paragraph" as const, content: "" }];

    try {
      editor.replaceBlocks(editor.document, blocks);
    } catch {
      // BlockNote may not be ready yet
    }
  }, [entry.id]);

  const getContentText = useCallback(() => {
    try {
      return editor?.document
        ?.map((block: any) => {
          if (!block.content) return "";
          if (Array.isArray(block.content)) {
            return block.content
              .map((inline: any) =>
                typeof inline === "string" ? inline : inline.text || ""
              )
              .join("");
          }
          return typeof block.content === "string" ? block.content : "";
        })
        .filter(Boolean)
        .join("\n\n") ?? "";
    } catch {
      return "";
    }
  }, [editor]);

  const debouncedSave = useCallback(
    (newTitle?: string) => {
      if (!onSave) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const content = getContentText();
        const titleVal = newTitle ?? title;
        if (titleVal !== lastSavedRef.current.title || entry.id !== lastSavedRef.current.entryId || content !== entry.content) {
          onSave(entry.id, { title: titleVal, content });
          lastSavedRef.current = { title: titleVal, entryId: entry.id };
        }
      }, 1000);
    },
    [onSave, entry.id, entry.content, title, getContentText]
  );

  // Save on editor content change
  useEffect(() => {
    const handler = () => debouncedSave();
    editor?.onChange?.(handler);
    return () => {};
  }, [editor, debouncedSave]);

  const wordCount = (() => {
    try {
      const text = editor?.document
        ?.map((block: any) => {
          if (!block.content) return "";
          if (Array.isArray(block.content)) {
            return block.content
              .map((inline: any) =>
                typeof inline === "string" ? inline : inline.text || ""
              )
              .join("");
          }
          return typeof block.content === "string" ? block.content : "";
        })
        .join(" ");
      return text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    } catch {
      return 0;
    }
  })();

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{entry.date}</span>
            {entry.people.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>{entry.people.join(", ")}</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Template
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedSave(e.target.value);
            }}
            placeholder="Untitled"
            className="w-full text-3xl font-bold text-foreground bg-transparent outline-none border-none placeholder:text-muted-foreground/40 mb-6 leading-tight"
          />

          {/* BlockNote editor */}
          <div className="blocknote-editor">
            <BlockNoteView
              editor={editor}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              className="min-h-[60vh]"
            />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t border-border px-4 py-1.5 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
        <span className="ml-auto">Auto-saved</span>
      </div>
    </div>
  );
}
