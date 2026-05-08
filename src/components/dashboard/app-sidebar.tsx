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
  color: string;
  exact?: boolean;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workflows",
    items: [
      { title: "Studio", href: "/dashboard", icon: Home, color: "text-duo-green", exact: true },
      { title: "Chat", href: "/chat", icon: MessageSquareText, color: "text-duo-blue" },
      { title: "Capture", href: "/dashboard/capture", icon: Mic2, color: "text-duo-orange" },
      { title: "Write", href: "/dashboard/journal/new", icon: Plus, color: "text-duo-green", exact: true },
    ],
  },
  {
    title: "Memory",
    items: [
      { title: "Timeline", href: "/dashboard/timeline", icon: Clock3, color: "text-duo-purple" },
      { title: "Insights", href: "/dashboard/insights", icon: ChartNoAxesCombined, color: "text-duo-red" },
      { title: "Archive", href: "/dashboard/journals", icon: Library, color: "text-duo-blue" },
      { title: "Memories", href: "/dashboard/memories", icon: Database, color: "text-duo-green" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "MCP", href: "/dashboard/mcp", icon: Cpu, color: "text-duo-blue" },
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
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r-2 border-duo-swan bg-background">
      <SidebarHeader className="flex h-20 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-3 w-full overflow-hidden whitespace-nowrap">
          <span className="flex size-10 items-center justify-center rounded-2xl border-2 border-duo-feather bg-duo-green text-sm font-black text-white shadow-[0_4px_0_var(--duo-feather-shadow)]">
            D
          </span>
          <span className="font-heading text-2xl font-black tracking-tight text-duo-green group-data-[collapsible=icon]:hidden">
            debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-6 px-3">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="mb-3 px-2 text-[11px] font-black uppercase tracking-[0.2em] text-duo-swan group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item)}
                      tooltip={item.title}
                      className="h-12 rounded-2xl border-2 border-transparent text-xs font-black uppercase tracking-wider text-duo-wolf transition hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-blue/10 data-[active=true]:text-duo-blue"
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
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
                    className="h-12 rounded-2xl border-2 border-transparent text-xs font-black uppercase tracking-wider text-duo-wolf transition hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-swan data-[active=true]:bg-duo-polar"
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-5 w-5 text-duo-wolf" />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={() => user?.signOut()}
                    tooltip="Sign Out"
                    className="h-12 rounded-2xl border-2 border-transparent text-xs font-black uppercase tracking-wider text-duo-wolf transition hover:border-duo-cardinal hover:bg-duo-red/10 hover:text-duo-red"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex flex-col gap-3 px-2 pb-1">
          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
            <ThemeToggle />
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="h-3 w-3 rounded-full bg-duo-green" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-green">Synced</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
