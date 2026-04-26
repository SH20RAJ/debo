"use client"

import * as React from "react"
import { BookOpen, Settings, LayoutDashboard, BrainCircuit, Network } from "lucide-react"

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
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b flex items-center justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold w-full">
          <BrainCircuit className="h-6 w-6" />
          <span className="tracking-tight text-xl font-bold">
            Debo
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/mcp"}>
                  <Link href="/dashboard/mcp">
                    <Network />
                    <span>MCP Integration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith("/dashboard/journal") && pathname !== "/dashboard/journal/new"}>
                  <Link href="/dashboard/journal/new">
                    <BookOpen />
                    <span>New Journal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings (BYOK)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between w-full">
          <ThemeToggle />
          <span className="text-xs text-muted-foreground font-medium">Free edge tier</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
