"use client";

import { Search, Plus, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onCommandMenuOpen: () => void;
}

export function Topbar({ onCommandMenuOpen }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 gap-3">
      {/* Search */}
      <button
        onClick={onCommandMenuOpen}
        className={cn(
          "flex items-center gap-2 flex-1 max-w-md h-9 px-3 rounded-lg",
          "bg-background border border-border text-muted-foreground text-sm",
          "hover:border-primary/30 transition-colors cursor-text"
        )}
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate">Search or ask Debo...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted text-[11px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-1">
        {/* Quick capture */}
        <button
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium",
            "bg-primary text-primary-foreground hover:brightness-105 transition-all"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Capture</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notification bell */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
