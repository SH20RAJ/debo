"use client"

import * as React from "react"
import {
  Settings,
  Home,
  MessageSquareText,
  Database,
  Library,
  LogOut,
  Mic2,
  Zap,
  BarChart3,
  Plug,
  Terminal,
  Radio,
  UsersRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@stackframe/stack"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const mainItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: Home, exact: true },
  { title: "Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { title: "Journals", href: "/dashboard/journals", icon: Library },
  { title: "Memories", href: "/dashboard/memories", icon: Database },
  { title: "Characters", href: "/dashboard/characters", icon: UsersRound },
];

const toolItems: NavItem[] = [
  { title: "Capture", href: "/dashboard/capture", icon: Mic2 },
  { title: "Talk", href: "/dashboard/talk", icon: Radio },
  { title: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { title: "Insights", href: "/dashboard/insights", icon: BarChart3 },
  { title: "MCP", href: "/dashboard/mcp", icon: Terminal },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUser()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderMenuItems = (items: NavItem[]) => (
    <SidebarMenu className="gap-0">
      {items.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.title}
              className={cn(
                "h-9 rounded-xl px-3 text-[13px] transition-all duration-200 border-none",
                "hover:bg-muted hover:text-foreground",
                "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-bold",
                "active:scale-[0.98]"
              )}
            >
              <Link href={item.href}>
                <item.icon className={cn("h-4 w-4 transition-all", active ? "opacity-100 text-primary" : "opacity-30")} />
                <span className={cn("tracking-tight", active ? "font-semibold" : "font-medium text-muted-foreground/60")}>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r-2 border-border bg-background">
      <SidebarHeader className="flex h-14 items-center px-4 gap-3 border-none">
        <Link href="/dashboard" className="flex items-center gap-2.5 w-full overflow-hidden whitespace-nowrap group">
          <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20 text-primary transition-all group-hover:bg-primary/20 group-hover:scale-105">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="font-heading text-base font-extrabold tracking-tight text-foreground/60 group-hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden">
            debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-5 px-2 pt-5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[9px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground/40 group-data-[collapsible=icon]:hidden mb-1">
            Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[9px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground/40 group-data-[collapsible=icon]:hidden mb-1">
            Logic
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(toolItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t-2 border-border space-y-1">
        <SidebarMenu className="gap-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/settings"}
              tooltip="Configuration"
              className={cn(
                "h-9 rounded-xl px-3 text-[13px] transition-all duration-200",
                "hover:bg-muted hover:text-foreground",
                "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-bold"
              )}
            >
              <Link href="/dashboard/settings">
                <Settings className={cn("h-4 w-4 transition-all", pathname === "/dashboard/settings" ? "opacity-100 text-primary" : "opacity-30")} />
                <span className={cn("tracking-tight", pathname === "/dashboard/settings" ? "font-semibold" : "font-medium text-muted-foreground/60")}>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => user?.signOut()}
              tooltip="Terminate Session"
              className="h-9 rounded-xl px-3 text-[13px] text-muted-foreground/30 hover:bg-destructive/5 transition-all hover:text-destructive group/logout"
            >
              <LogOut className="h-4 w-4 opacity-30 group-hover/logout:opacity-100 transition-all" />
              <span className="font-medium tracking-tight">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="pt-2 flex items-center justify-between px-3 group-data-[collapsible=icon]:justify-center">
          <ThemeToggle />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <div className="h-1 w-1 rounded-full bg-primary/30" />
            <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/30">v1.0.4</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
