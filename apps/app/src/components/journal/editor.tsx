"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Quote,
  Code,
  Slash,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "./journal-page";

interface JournalEditorProps {
  entry: JournalEntry;
}

const TOOLBAR_ITEMS = [
  { icon: Bold, label: "Bold", shortcut: "Ctrl+B" },
  { icon: Italic, label: "Italic", shortcut: "Ctrl+I" },
  { icon: Heading1, label: "Heading", shortcut: "Ctrl+Shift+1" },
  { icon: List, label: "List", shortcut: "Ctrl+Shift+8" },
  { icon: Quote, label: "Quote", shortcut: "Ctrl+Shift+9" },
  { icon: Code, label: "Code", shortcut: "Ctrl+E" },
] as const;

export function JournalEditor({ entry }: JournalEditorProps) {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update when entry changes
  const prevIdRef = useRef(entry.id);
  if (prevIdRef.current !== entry.id) {
    prevIdRef.current = entry.id;
    setTitle(entry.title);
    setContent(entry.content);
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab" && content === "") {
        e.preventDefault();
        // Show slash command menu placeholder
      }
    },
    [content]
  );

  // Auto-resize textarea
  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, []);

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-0.5 px-4 py-2">
          {TOOLBAR_ITEMS.map(({ icon: Icon, label, shortcut }) => (
            <button
              key={label}
              title={`${label} (${shortcut})`}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <button
            title="Slash commands"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Slash className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Template
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full text-3xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40 mb-4 leading-tight"
          />

          {/* Metadata line */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
            <span>{entry.date}</span>
            {entry.people.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>{entry.people.join(", ")}</span>
              </>
            )}
          </div>

          {/* Content textarea styled as editor */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Start writing, or type / for commands..."
            className={cn(
              "w-full min-h-[60vh] bg-transparent outline-none resize-none",
              "text-[15px] leading-relaxed text-foreground",
              "placeholder:text-muted-foreground/40",
              "selection:bg-primary/20"
            )}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t border-border px-4 py-1.5 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
        <span className="ml-auto">Saved</span>
      </div>
    </div>
  );
}
