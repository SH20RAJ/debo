"use client"

import * as React from "react"
import { 
  BookOpen, 
  Settings, 
  LayoutDashboard, 
  BrainCircuit, 
  Network, 
  Library, 
  Mic, 
  Plus,
  Search,
  History,
  User,
  LogOut,
  ChevronRight,
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
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="h-14 border-b/50 flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold w-full overflow-hidden whitespace-nowrap">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="tracking-tight text-lg group-data-[collapsible=icon]:hidden">
            Debo <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">v1.1</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Repository</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard"}
                  tooltip="Overview"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/agent"}
                  tooltip="Voice Agent"
                >
                  <Link href="/dashboard/agent">
                    <Mic className="h-4 w-4" />
                    <span>Voice Intelligence</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Intelligence Context */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/mcp"}
                  tooltip="MCP Integration"
                >
                  <Link href="/dashboard/mcp">
                    <Network className="h-4 w-4" />
                    <span>MCP Gateway</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/journals"}
                  tooltip="All Journals"
                >
                  <Link href="/dashboard/journals">
                    <Library className="h-4 w-4" />
                    <span>Historical Archive</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Creation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/journal/new"}
                  className="bg-primary/5 hover:bg-primary/10 text-primary font-medium"
                  tooltip="New Entry"
                >
                  <Link href="/dashboard/journal/new">
                    <Plus className="h-4 w-4" />
                    <span>New Entry</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t/50 p-4 space-y-4">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>Configuration</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
          <ThemeToggle />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
