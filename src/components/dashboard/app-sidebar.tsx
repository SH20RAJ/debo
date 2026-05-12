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

const mainItems: NavItem[] = [
  { title: "Home", href: "/dashboard", icon: Home, exact: true },
  { title: "Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { title: "Journals", href: "/dashboard/journals", icon: Library },
  { title: "Memories", href: "/dashboard/memories", icon: Database },
  { title: "Timeline", href: "/dashboard/timeline", icon: Clock },
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
    <SidebarMenu className="gap-0.5">
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.href, item.exact)}
            tooltip={item.title}
            className={cn(
              "h-9 rounded-md px-3 text-sm transition-all duration-200 border-none",
              "hover:bg-muted/40 hover:text-foreground",
              "data-[active=true]:bg-primary/5 data-[active=true]:text-primary data-[active=true]:font-medium",
              "active:scale-[0.98]"
            )}
          >
            <Link href={item.href}>
              <item.icon className={cn("h-4 w-4 opacity-70 transition-opacity", isActive(item.href, item.exact) && "opacity-100")} />
              <span className="font-medium tracking-tight">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r border-border/10 bg-background">
      <SidebarHeader className="flex h-14 items-center px-4 gap-3 border-b border-border/10">
        <Link href="/dashboard" className="flex items-center gap-2.5 w-full overflow-hidden whitespace-nowrap group">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary transition-all group-hover:scale-105">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground leading-none group-data-[collapsible=icon]:hidden">
            debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-6 px-2 pt-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30 group-data-[collapsible=icon]:hidden mb-1">
            Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30 group-data-[collapsible=icon]:hidden mb-1">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(toolItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/10 space-y-1">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/settings"}
              tooltip="Settings"
              className={cn(
                "h-9 rounded-md px-3 text-sm transition-all duration-200",
                "hover:bg-muted/40 hover:text-foreground",
                "data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
              )}
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 opacity-70" />
                <span className="font-medium tracking-tight">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => user?.signOut()}
              tooltip="Sign Out"
              className="h-9 rounded-md px-3 text-sm text-destructive/60 hover:bg-destructive/5 transition-all hover:text-destructive"
            >
              <LogOut className="h-4 w-4 opacity-70" />
              <span className="font-medium tracking-tight">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="pt-3 flex items-center justify-between px-3 group-data-[collapsible=icon]:justify-center">
          <ThemeToggle />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden opacity-20 hover:opacity-100 transition-opacity">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Stable</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}