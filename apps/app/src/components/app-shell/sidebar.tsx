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
  Shield,
  Sun,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Core",
    items: [
      { label: "Home", href: "/dashboard", icon: LayoutDashboard, shortcut: "H" },
      { label: "Ask Debo", href: "/dashboard/ask", icon: MessageSquare, shortcut: "A" },
      { label: "Journal", href: "/dashboard/journal", icon: BookOpen, shortcut: "J" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Voice", href: "/dashboard/voice", icon: Mic },
      { label: "Debo Mail", href: "/dashboard/mail", icon: Inbox },
      { label: "Connectors", href: "/dashboard/connectors", icon: Plug },
      { label: "Vault", href: "/dashboard/vault", icon: Shield },
    ],
  },
  {
    label: "Memory",
    items: [
      { label: "Inbox", href: "/dashboard/inbox", icon: Bell, badge: "5" },
      { label: "Daily Debrief", href: "/dashboard/debrief", icon: Sun },
      { label: "Timeline", href: "/dashboard/timeline", icon: Clock },
      { label: "Library", href: "/dashboard/library", icon: Library, shortcut: "L" },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
      { label: "Decisions", href: "/dashboard/decisions", icon: Diamond },
      { label: "People", href: "/dashboard/people", icon: Users },
      { label: "Follow-Up Radar", href: "/dashboard/radar", icon: Radar },
    ],
  },
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
            {collapsed ? (
              // Collapsed: flat list, no sections
              navSections.flatMap((section) =>
                section.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    collapsed
                  />
                ))
              )
            ) : (
              // Expanded: accordion sections
              <Accordion type="multiple" defaultValue={["Core", "Tools"]}>
                {navSections.map((section) => (
                  <AccordionItem key={section.label} value={section.label} className="border-b-0">
                    <AccordionTrigger className="py-1.5 px-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider hover:no-underline hover:bg-transparent">
                      {section.label}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-0.5">
                        {section.items.map((item) => (
                          <SidebarItem
                            key={item.href}
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
          {bottomNav.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}

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

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
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
      <item.icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {item.badge}
            </Badge>
          )}
          {item.shortcut && (
            <kbd className="hidden lg:inline-flex text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity bg-muted px-1.5 py-0.5 rounded">
              {item.shortcut}
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
            {item.shortcut && (
              <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {item.shortcut}
              </kbd>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
