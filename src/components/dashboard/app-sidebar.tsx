"use client"

import * as React from "react"
import { BookOpen, Settings, LayoutDashboard, BrainCircuit, MessageSquareText } from "lucide-react"

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

import { useChatsStore } from "@/lib/chats-store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { chats, fetchChats, setActiveChatId, activeChatId } = useChatsStore()

  React.useEffect(() => {
    fetchChats()
  }, [fetchChats])

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-border/50 flex items-center justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold w-full">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="tracking-tight text-xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
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
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/companion"}>
                  <Link href="/dashboard/companion" onClick={() => setActiveChatId(null)}>
                    <MessageSquareText />
                    <span>Companion</span>
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

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Chats
            </div>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeChatId === chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <Link href="/dashboard/companion">
                      <MessageSquareText className="h-4 w-4" />
                      <span className="truncate">{chat.title || "Untitled Chat"}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center justify-between w-full">
          <ThemeToggle />
          <span className="text-xs text-muted-foreground font-medium">Free edge tier</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
