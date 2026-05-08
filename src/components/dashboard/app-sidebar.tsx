"use client"

import * as React from "react"
import {
  Settings,
  Home,
  Plus,
  MessageSquareText,
  Database,
  Library,
  ChartNoAxesCombined,
  Clock3,
  LogOut,
  Cpu,
  Mic2,
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
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@stackframe/stack"

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workflows",
    items: [
      { title: "Studio", href: "/dashboard", icon: Home, exact: true },
      { title: "Chat", href: "/chat", icon: MessageSquareText },
      { title: "Capture", href: "/dashboard/capture", icon: Mic2 },
      { title: "Write", href: "/dashboard/journal/new", icon: Plus, exact: true },
    ],
  },
  {
    title: "Memory",
    items: [
      { title: "Timeline", href: "/dashboard/timeline", icon: Clock3 },
      { title: "Insights", href: "/dashboard/insights", icon: ChartNoAxesCombined },
      { title: "Archive", href: "/dashboard/journals", icon: Library },
      { title: "Memories", href: "/dashboard/memories", icon: Database },
    ],
  },
  {
    title: "System",
    items: [
      { title: "MCP", href: "/dashboard/mcp", icon: Cpu },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUser()

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r border-border bg-background">
      <SidebarHeader className="flex h-20 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-3 w-full overflow-hidden whitespace-nowrap">
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-foreground text-sm font-semibold text-background">
            D
          </span>
          <span className="font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Debo Studio
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-6 px-3">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item)}
                      tooltip={item.title}
                      className="h-10 rounded-md text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="space-y-3 p-3 pt-0">
        <SidebarMenu className="gap-2">
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                    className="h-10 rounded-md text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={() => user?.signOut()}
                    tooltip="Sign Out"
                    className="h-10 rounded-md text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex flex-col gap-3 px-2 pb-1">
          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
            <ThemeToggle />
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-muted-foreground">Synced</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
