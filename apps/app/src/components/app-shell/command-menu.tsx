"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  BookOpen,
  Mic,
  Upload,
  Link as LinkIcon,
  MessageSquare,
  Library,
  Users,
  CheckSquare,
  Plug,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

const commands: CommandItem[] = [
  // Capture
  { icon: BookOpen, label: "New journal entry", shortcut: "⌘J", group: "Capture", action: () => {} },
  { icon: Mic, label: "Record voice note", shortcut: "⌘⇧V", group: "Capture", action: () => {} },
  { icon: Upload, label: "Upload file", shortcut: "⌘U", group: "Capture", action: () => {} },
  { icon: LinkIcon, label: "Save link", group: "Capture", action: () => {} },

  // Ask
  { icon: MessageSquare, label: "Ask Debo", shortcut: "⌘A", group: "Ask", action: () => {} },
  { icon: Search, label: "Search memories", group: "Ask", action: () => {} },
  { icon: CheckSquare, label: "Find tasks", group: "Ask", action: () => {} },
  { icon: Users, label: "Find person", group: "Ask", action: () => {} },

  // Navigate
  { icon: Library, label: "Go to Library", shortcut: "⌘L", group: "Navigate", action: () => {} },
  { icon: Users, label: "Go to People", group: "Navigate", action: () => {} },
  { icon: CheckSquare, label: "Go to Tasks", group: "Navigate", action: () => {} },
  { icon: Plug, label: "Go to Connectors", group: "Navigate", action: () => {} },

  // Actions
  { icon: Upload, label: "Export memory", group: "Actions", action: () => {} },
  { icon: Plug, label: "Connect Gmail", group: "Actions", action: () => {} },
  { icon: CheckSquare, label: "Review extracted tasks", group: "Actions", action: () => {} },
];

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
}

export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const groups = ["Capture", "Ask", "Navigate", "Actions"].reduce<
    Record<string, CommandItem[]>
  >((acc, group) => {
    const items = filtered.filter((c) => c.group === group);
    if (items.length) acc[group] = items;
    return acc;
  }, {});

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed z-50 top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[540px] px-4">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a command..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto py-2">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                {items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="text-[11px] font-mono text-muted-foreground/60">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {Object.keys(groups).length === 0 && (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                No results found.
              </p>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
