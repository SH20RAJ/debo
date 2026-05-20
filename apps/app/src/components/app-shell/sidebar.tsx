"use client";

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
  Bell,
  Clock,
  Diamond,
  Radar,
  Plug,
  Inbox,
  Mic,
  Video,
  Shield,
  Sun,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSidebarPrefs, type SidebarItemDef } from "@/lib/sidebar-prefs";

// ── Icon & metadata map ────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: LayoutDashboard,
  ask: MessageSquare,
  journal: BookOpen,
  voice: Mic,
  media: Video,
  mail: Inbox,
  connectors: Plug,
  vault: Shield,
  inbox: Bell,
  debrief: Sun,
  timeline: Clock,
  library: Library,
  tasks: CheckSquare,
  projects: FolderKanban,
  decisions: Diamond,
  people: Users,
  radar: Radar,
};

const SHORTCUT_MAP: Record<string, string> = {
  home: "H",
  ask: "A",
  journal: "J",
  library: "L",
};

const BADGE_MAP: Record<string, string> = {
  inbox: "5",
};

function getItemMeta(id: string) {
  return {
    icon: ICON_MAP[id] ?? LayoutDashboard,
    shortcut: SHORTCUT_MAP[id],
    badge: BADGE_MAP[id],
  };
}

// ── Nav item ───────────────────────────────────────────────────────────────

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: SidebarItemDef;
  active: boolean;
  collapsed: boolean;
}) {
  const { icon, shortcut, badge } = getItemMeta(item.id);

  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all relative group",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary/10 text-primary shadow-[0_3px_0_var(--border)] font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {(() => {
        const Icon = icon;
        return <Icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />;
      })()}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {badge && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {badge}
            </Badge>
          )}
          {shortcut && (
            <kbd className="hidden lg:inline-flex text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity bg-muted px-1.5 py-0.5 rounded">
              {shortcut}
            </kbd>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <div className="flex items-center gap-2">
            <span>{item.label}</span>
            {shortcut && (
              <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {shortcut}
              </kbd>
            )}
          </div>
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
  const { prefs, loaded, toggleSection } = useSidebarPrefs();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Accordion value = section IDs where collapsed === false
  const openSections = prefs.sections.filter((s) => !s.collapsed).map((s) => s.id);

  const handleAccordionChange = (values: string[]) => {
    // Find which section was toggled
    for (const section of prefs.sections) {
      const wasOpen = openSections.includes(section.id);
      const isOpen = values.includes(section.id);
      if (wasOpen !== isOpen) {
        toggleSection(section.id);
      }
    }
  };

  // Build items per section (only non-hidden)
  const visibleSections = prefs.sections
    .map((section) => ({
      ...section,
      items: section.itemIds
        .filter((id) => !prefs.hiddenItemIds.includes(id))
        .map((id) => ALL_NAV_ITEMS_MAP[id])
        .filter(Boolean),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col h-full bg-card border-r border-border transition-all duration-200 ease-in-out select-none overflow-hidden",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          {collapsed ? (
            <Link href="/dashboard" className="text-lg font-heading font-bold text-primary mx-auto">
              d
            </Link>
          ) : (
            <Link href="/dashboard" className="text-lg font-heading font-bold text-primary tracking-tight">
              debo
            </Link>
          )}
        </div>

        {/* Primary nav */}
        <ScrollArea className="flex-1">
          <nav className="py-2 px-2">
            {!loaded ? (
              // Skeleton while loading prefs
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : collapsed ? (
              // Collapsed: flat list, no sections
              visibleSections.flatMap((section) =>
                section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    active={isActive(item.href)}
                    collapsed
                  />
                ))
              )
            ) : (
              // Expanded: accordion sections
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={handleAccordionChange}
              >
                {visibleSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="border-b-0">
                    <AccordionTrigger className="py-1.5 px-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider hover:no-underline hover:bg-transparent">
                      {section.label}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-0.5">
                        {section.items.map((item) => (
                          <SidebarItem
                            key={item.id}
                            item={item}
                            active={isActive(item.href)}
                            collapsed={false}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </nav>
        </ScrollArea>

        {/* Bottom nav + user */}
        <div className="border-t border-border py-2 px-2 space-y-0.5">
          <SidebarItem
            item={{ id: "settings", label: "Settings", href: "/dashboard/settings" }}
            active={isActive("/dashboard/settings")}
            collapsed={collapsed}
          />

          <Separator className="my-2" />

          {/* User section */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-accent transition-colors",
                  collapsed && "justify-center px-0"
                )}
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                    S
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Shaswat</p>
                    <p className="text-[11px] text-muted-foreground truncate">Free plan</p>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                <p className="font-medium">Shaswat</p>
                <p className="text-muted-foreground">Free plan</p>
              </TooltipContent>
            )}
          </Tooltip>

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

// ── Item lookup map ────────────────────────────────────────────────────────

import { ALL_NAV_ITEMS } from "@/lib/sidebar-prefs";

const ALL_NAV_ITEMS_MAP: Record<string, SidebarItemDef> = Object.fromEntries(
  ALL_NAV_ITEMS.map((item) => [item.id, item])
);
