"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Library,
  CheckSquare,
  Users,
  FolderKanban,
  Plug,
  Inbox,
  Mic,
  Video,
  Shield,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Navigation items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { id: "ask", label: "Ask Debo", href: "/dashboard/ask", icon: MessageSquare },
  { id: "journal", label: "Journal", href: "/dashboard/journal", icon: BookOpen },
  { id: "voice", label: "Voice", href: "/dashboard/voice", icon: Mic },
  { id: "media", label: "Media", href: "/dashboard/media", icon: Video },
  { id: "library", label: "Library", href: "/dashboard/library", icon: Library },
  { id: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { id: "people", label: "People", href: "/dashboard/people", icon: Users },
  { id: "projects", label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { id: "mail", label: "Debo Mail", href: "/dashboard/mail", icon: Inbox },
  { id: "connectors", label: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { id: "vault", label: "Vault", href: "/dashboard/vault", icon: Shield },
];

// ── Nav item component ──────────────────────────────────────────────────────

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ── Sidebar ────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col h-full bg-card border-r border-border transition-all duration-200 ease-in-out select-none overflow-hidden",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          {collapsed ? (
            <Link href="/dashboard" className="text-lg font-bold text-primary mx-auto">
              d
            </Link>
          ) : (
            <Link href="/dashboard" className="text-lg font-bold text-primary tracking-tight">
              debo
            </Link>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="py-2 px-2 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom: Settings + User + Logout */}
        <div className="border-t border-border py-2 px-2 space-y-1">
          <SidebarItem
            item={{ label: "Settings", href: "/dashboard/settings", icon: Settings }}
            active={isActive("/dashboard/settings")}
            collapsed={collapsed}
          />

          <Separator className="my-2" />

          <Suspense fallback={<SidebarUserFallback collapsed={collapsed} />}>
            <SidebarUser collapsed={collapsed} />
          </Suspense>

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                onClick={onToggle}
                className={cn(
                  "w-full text-muted-foreground hover:text-foreground",
                  !collapsed && "justify-start gap-3 px-3"
                )}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <ChevronsRight className="w-4 h-4" />
                ) : (
                  <>
                    <ChevronsLeft className="w-4 h-4" />
                    <span className="text-xs">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const user = useUser();

  const handleLogout = async () => {
    try {
      await user?.signOut();
      router.push("/");
    } catch {
      // Force redirect even if signOut fails
      router.push("/handler/signout");
    }
  };

  // User display info
  const displayName = user?.displayName || user?.primaryEmail?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* User info */}
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg",
          collapsed && "justify-center px-0"
        )}
      >
        <Avatar className="w-7 h-7">
          {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.primaryEmail || ""}
            </p>
          </div>
        )}
      </div>

      {/* Logout button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={handleLogout}
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              !collapsed && "justify-start gap-3 px-3"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-xs">Sign out</span>}
          </Button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" sideOffset={8}>
            Sign out
          </TooltipContent>
        )}
      </Tooltip>
    </>
  );
}

function SidebarUserFallback({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg",
          collapsed && "justify-center px-0"
        )}
        aria-hidden="true"
      >
        <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
        {!collapsed && (
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-28 rounded bg-muted animate-pulse" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size={collapsed ? "icon" : "default"}
        disabled
        className={cn(
          "w-full text-muted-foreground",
          !collapsed && "justify-start gap-3 px-3"
        )}
      >
        <LogOut className="w-4 h-4" />
        {!collapsed && <span className="text-xs">Sign out</span>}
      </Button>
    </>
  );
}
