"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Library,
  CheckSquare,
  Users,
  FolderKanban,
  Plug,
  Mic,
  Shield,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

const primaryNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard, shortcut: "⌘H" },
  { label: "Ask Debo", href: "/dashboard/ask", icon: MessageSquare, shortcut: "⌘A" },
  { label: "Journal", href: "/dashboard/journal", icon: BookOpen, shortcut: "⌘J" },
  { label: "Library", href: "/dashboard/library", icon: Library, shortcut: "⌘L" },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "People", href: "/dashboard/people", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { label: "Voice", href: "/dashboard/voice", icon: Mic },
  { label: "Vault", href: "/dashboard/vault", icon: Shield },
];

const bottomNav: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

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
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-200 ease-in-out",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-primary tracking-tight">
            debo
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-primary mx-auto">
            d
          </Link>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {primaryNav.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-border py-2 px-2 space-y-0.5">
        {bottomNav.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        {/* User section */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 mt-1 rounded-lg",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Shaswat</p>
              <p className="text-xs text-muted-foreground truncate">Free plan</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed && "justify-center px-0"
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
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.shortcut && (
            <span className="text-[11px] text-muted-foreground/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {item.shortcut}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
