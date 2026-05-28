"use client";

import { Search, Plus, Bell, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  onCommandMenuOpen: () => void;
  onMobileMenuToggle?: () => void;
}

export function Topbar({ onCommandMenuOpen, onMobileMenuToggle }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 gap-3">
      {/* Mobile menu toggle */}
      {onMobileMenuToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="md:hidden text-muted-foreground hover:text-foreground rounded-xl shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Search trigger */}
      <button
        onClick={onCommandMenuOpen}
        className={cn(
          "flex items-center gap-2 flex-1 max-w-md h-10 px-4 rounded-xl",
          "bg-background border-2 border-border text-muted-foreground text-sm",
          "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-text"
        )}
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate">Search or ask Debo...</span>
        <kbd suppressHydrationWarning className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg border border-border bg-muted text-[11px] font-mono font-semibold text-muted-foreground">
          {typeof navigator !== "undefined" && navigator?.platform?.includes("Mac") ? "\u2318" : "Ctrl+"}K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5">
        {/* Quick capture */}
        <Button
          className={cn(
            "rounded-xl bg-primary text-primary-foreground font-bold",
            "shadow-[0_4px_0_#46A302] hover:brightness-105 hover:shadow-[0_4px_0_#46A302]",
            "active:translate-y-[2px] active:shadow-none transition-all"
          )}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Capture</span>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground rounded-xl"
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground rounded-xl relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-2 w-2 p-0 rounded-full border-2 border-card" />
        </Button>
      </div>
    </header>
  );
}
