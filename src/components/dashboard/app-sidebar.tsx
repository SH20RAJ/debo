"use client"

import * as React from "react"
import { 
  Settings, 
  LayoutDashboard, 
  Plus,
  Search,
  Database,
  Library,
  ChartNoAxesCombined,
  Clock3,
  LogOut
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUser()

  const items = [
    {
      title: "Core",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Ask Life", href: "/dashboard/ask", icon: Search },
        { title: "Journal", href: "/dashboard/journal/new", icon: Plus },
        { title: "Timeline", href: "/dashboard/timeline", icon: Clock3 },
        { title: "Insights", href: "/dashboard/insights", icon: ChartNoAxesCombined },
      ]
    },
    {
      title: "Library",
      items: [
        { title: "Archive", href: "/dashboard/journals", icon: Library },
        { title: "Memories", href: "/dashboard/memories", icon: Database },
      ]
    }
  ]

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r border-border/40">
      <SidebarHeader className="h-20 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold w-full overflow-hidden whitespace-nowrap">
          <span className="tracking-tight text-xl group-data-[collapsible=icon]:hidden">
            Debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-6">
        {items.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 group-data-[collapsible=icon]:hidden mb-2">
                {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="h-10 rounded-lg transition-all hover:bg-muted/50 data-[active=true]:bg-muted data-[active=true]:text-foreground"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 pt-0 space-y-4">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                    className="h-10 rounded-lg transition-all hover:bg-muted/50 data-[active=true]:bg-muted"
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={() => user?.signOut()}
                    tooltip="Sign Out"
                    className="h-10 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground hover:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center px-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Synced</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
