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
  Clock,
  Terminal,
  Radio,
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

const exploreItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: Home, exact: true },
  { title: "Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { title: "Journals", href: "/dashboard/journals", icon: Library },
  { title: "Memories", href: "/dashboard/memories", icon: Database },
];

const systemItems: NavItem[] = [
  { title: "Insights", href: "/dashboard/insights", icon: BarChart3 },
  { title: "Timeline", href: "/dashboard/timeline", icon: Clock },
  { title: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { title: "Talk", href: "/dashboard/talk", icon: Radio },
  { title: "Capture", href: "/dashboard/capture", icon: Mic2 },
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
    <SidebarMenu className="gap-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.href, item.exact)}
            tooltip={item.title}
            className={cn(
              "h-10 rounded-lg border border-transparent text-sm transition-all duration-200",
              "hover:bg-muted/50 hover:text-foreground",
              "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-bold",
              "active:scale-[0.98]"
            )}
          >
            <Link href={item.href}>
              <item.icon className={cn("h-4.5 w-4.5 transition-transform group-hover:scale-110", isActive(item.href, item.exact) && "scale-110")} />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r border-border/5 bg-sidebar-background">
      <SidebarHeader className="flex h-16 items-center px-4 gap-3 border-b border-border/5">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors -ml-1 h-8 w-8" />
        <Link href="/dashboard" className="flex items-center gap-2 w-full overflow-hidden whitespace-nowrap group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm transition-all group-hover:scale-105">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="font-heading text-xl font-black tracking-tight text-foreground leading-none group-data-[collapsible=icon]:hidden">
            debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 pt-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 group-data-[collapsible=icon]:hidden mb-1">
            Explore
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(exploreItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 group-data-[collapsible=icon]:hidden mb-1">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(systemItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/5 space-y-1">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/settings"}
              tooltip="Settings"
              className={cn(
                "h-10 rounded-lg border border-transparent text-sm transition-all duration-200",
                "hover:bg-muted/50 hover:text-foreground",
                "data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              )}
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4.5 w-4.5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => user?.signOut()}
              tooltip="Sign Out"
              className="h-10 rounded-lg border border-transparent text-sm text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="pt-2 flex items-center justify-between px-2 group-data-[collapsible=icon]:justify-center">
          <ThemeToggle />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden opacity-40 hover:opacity-100 transition-opacity">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Live</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}