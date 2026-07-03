"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

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
  const candidates = Object.keys(TITLES)
    .filter((k) => pathname.startsWith(k + "/") || pathname === k)
    .sort((a, b) => b.length - a.length);
  return candidates[0] ? TITLES[candidates[0]] : "Debo";
}

export function Topbar({
  onCommandMenuOpen,
}: {
  onCommandMenuOpen: () => void;
}) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const title = deriveTitle(pathname);

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 shrink-0">
      <SidebarTrigger className="-ml-1" />
      <h1 className="text-base font-semibold truncate">{title}</h1>

      <div className="flex-1" />

      <button
        onClick={onCommandMenuOpen}
        className="flex h-9 w-72 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-muted-foreground text-sm hover:bg-muted transition-colors"
        aria-label="Open command menu"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search or ask Debo...</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")
        }
        aria-label="Toggle theme"
      >
        <Sun className="size-4 dark:hidden" />
        <Moon className="size-4 hidden dark:block" />
      </Button>

      <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
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
    <Avatar className="size-8">
      {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
      <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
    </Avatar>
  );
}
