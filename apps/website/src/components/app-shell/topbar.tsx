"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Search, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopbarProps {
  onCommandMenuOpen: () => void;
  onMobileMenuToggle?: () => void;
}

const TITLES: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/ask": "Ask Debo",
  "/dashboard/chat": "Chat",
  "/dashboard/journal": "Journal",
  "/dashboard/voice": "Voice",
  "/dashboard/media": "Media",
  "/dashboard/library": "Library",
  "/dashboard/tasks": "Tasks",
  "/dashboard/people": "People",
  "/dashboard/projects": "Projects",
  "/dashboard/mail": "Debo Mail",
  "/dashboard/connectors": "Connectors",
  "/dashboard/vault": "Vault",
  "/dashboard/inbox": "Memory Inbox",
  "/dashboard/decisions": "Decisions",
  "/dashboard/timeline": "Timeline",
  "/dashboard/radar": "Radar",
  "/dashboard/debrief": "Debrief",
  "/dashboard/settings": "Settings",
};

function deriveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  // Match deepest known prefix
  const candidates = Object.keys(TITLES)
    .filter((k) => pathname.startsWith(k + "/") || pathname === k)
    .sort((a, b) => b.length - a.length);
  return candidates[0] ? TITLES[candidates[0]] : "Debo";
}

export function Topbar({ onCommandMenuOpen, onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const title = deriveTitle(pathname);

  return (
    <header className="flex items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 gap-3">
      {onMobileMenuToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="md:hidden text-muted-foreground hover:text-foreground rounded-xl shrink-0 hover:bg-accent/60"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      <h1 className="text-base font-semibold text-foreground font-[var(--font-nunito)] truncate">
        {title}
      </h1>

      <div className="flex-1" />

      <button
        onClick={onCommandMenuOpen}
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-xl",
          "bg-background border-2 border-border text-muted-foreground text-sm",
          "hover:border-primary/40 hover:bg-accent/40 transition-colors cursor-text",
          "max-w-[280px]"
        )}
        aria-label="Open command menu"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="hidden md:inline truncate">Search or ask Debo...</span>
        <kbd
          suppressHydrationWarning
          className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md border border-border bg-muted text-[11px] font-mono font-semibold text-muted-foreground"
        >
          {typeof navigator !== "undefined" && navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl+"}K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent/60"
        aria-label="Toggle theme"
      >
        <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <Suspense fallback={<div className="size-8 rounded-full bg-muted animate-pulse" />}>
        <TopbarUser />
      </Suspense>
    </header>
  );
}

function TopbarUser() {
  const user = useUser();
  const displayName = user?.displayName || user?.primaryEmail?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Avatar className="w-8 h-8">
      {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
      <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
