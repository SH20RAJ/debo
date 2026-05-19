"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

const commands: CommandItem[] = [
  // Capture
  { icon: BookOpen, label: "New journal entry", shortcut: "\u2318J", group: "Capture", action: () => {} },
  { icon: Mic, label: "Record voice note", shortcut: "\u2318\u21E7V", group: "Capture", action: () => {} },
  { icon: Upload, label: "Upload file", shortcut: "\u2318U", group: "Capture", action: () => {} },
  { icon: LinkIcon, label: "Save link", group: "Capture", action: () => {} },

  // Ask
  { icon: MessageSquare, label: "Ask Debo", shortcut: "\u2318A", group: "Ask", action: () => {} },
  { icon: Search, label: "Search memories", group: "Ask", action: () => {} },
  { icon: CheckSquare, label: "Find tasks", group: "Ask", action: () => {} },
  { icon: Users, label: "Find person", group: "Ask", action: () => {} },

  // Navigate
  { icon: Library, label: "Go to Library", shortcut: "\u2318L", group: "Navigate", action: () => {} },
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const groupOrder = ["Capture", "Ask", "Navigate", "Actions"];
  const groups = groupOrder.reduce<Record<string, CommandItem[]>>((acc, group) => {
    const items = filtered.filter((c) => c.group === group);
    if (items.length) acc[group] = items;
    return acc;
  }, {});

  const flatItems = Object.values(groups).flat();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && flatItems[selectedIndex]) {
        e.preventDefault();
        flatItems[selectedIndex].action();
        onClose();
      }
    },
    [flatItems, selectedIndex, onClose]
  );

  let itemIndex = -1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "top-[20%] translate-y-0 max-w-[540px] gap-0 p-0 overflow-hidden",
          "rounded-2xl border-2 border-border bg-card",
          "shadow-[0_4px_0_var(--border)]"
        )}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <DialogDescription className="sr-only">
          Search for commands, navigate, or perform actions
        </DialogDescription>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search or type a command..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none font-medium"
            autoFocus
          />
          {query && (
            <Badge variant="secondary" className="text-[10px]">
              {filtered.length}
            </Badge>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[360px]">
          <div className="py-2">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </p>
                {items.map((item) => {
                  itemIndex++;
                  const idx = itemIndex;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all mx-1 rounded-xl",
                        "max-w-[calc(100%-8px)]",
                        isSelected
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.shortcut && (
                        <kbd className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                          isSelected
                            ? "border-primary/20 text-primary bg-primary/5"
                            : "border-border text-muted-foreground/50 bg-muted"
                        )}>
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {Object.keys(groups).length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground font-medium">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded border border-border bg-muted font-mono text-[10px]">
              &uarr;&darr;
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded border border-border bg-muted font-mono text-[10px]">
              &crarr;
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded border border-border bg-muted font-mono text-[10px]">
              esc
            </kbd>
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
