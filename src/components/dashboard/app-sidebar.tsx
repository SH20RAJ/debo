"use client"

import * as React from "react"
import { 
  Settings, 
  LayoutDashboard, 
  Plus,
  Search,
  Database,
  Library,
  Sparkles
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
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const items = [
    {
      title: "Core",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Ask Life", href: "/dashboard/ask", icon: Search },
        { title: "Journal", href: "/dashboard/journal/new", icon: Plus },
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
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="h-20 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-4 font-bold w-full overflow-hidden whitespace-nowrap">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
             <Sparkles className="h-6 w-6" />
          </div>
          <span className="tracking-tighter text-2xl group-data-[collapsible=icon]:hidden">
            Debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {items.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="h-12 rounded-xl transition-all hover:bg-muted"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                    className="h-12 rounded-xl"
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium text-base">Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center px-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-muted-foreground">Connected</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
