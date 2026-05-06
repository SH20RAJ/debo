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
  LogOut,
  Cpu
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
        { title: "Home", href: "/dashboard", icon: LayoutDashboard, color: "text-duo-green" },
        { title: "Ask Life", href: "/dashboard/ask", icon: Search, color: "text-duo-blue" },
        { title: "Journal", href: "/dashboard/journal/new", icon: Plus, color: "text-duo-orange" },
        { title: "Timeline", href: "/dashboard/timeline", icon: Clock3, color: "text-duo-purple" },
        { title: "Insights", href: "/dashboard/insights", icon: ChartNoAxesCombined, color: "text-duo-red" },
      ]
    },
    {
      title: "Library",
      items: [
        { title: "Archive", href: "/dashboard/journals", icon: Library, color: "text-duo-blue" },
        { title: "Memories", href: "/dashboard/memories", icon: Database, color: "text-duo-green" },
      ]
    },
    {
      title: "Connectivity",
      items: [
        { title: "MCP", href: "/dashboard/mcp", icon: Cpu, color: "text-duo-blue" },
      ]
    }
  ]

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r-2 border-duo-swan bg-white">
      <SidebarHeader className="h-24 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3 w-full overflow-hidden whitespace-nowrap">
          <span className="font-heading font-black text-3xl tracking-tight text-duo-green group-data-[collapsible=icon]:hidden">
            debo
          </span>
          <div className="size-8 rounded-lg bg-duo-green hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 gap-8">
        {items.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="px-2 text-xs font-black uppercase tracking-[0.2em] text-duo-swan group-data-[collapsible=icon]:hidden mb-4">
                {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className={`h-12 rounded-2xl transition-all border-2 border-transparent uppercase font-black text-xs tracking-wider
                        hover:bg-duo-polar hover:border-duo-swan
                        data-[active=true]:bg-duo-blue/10 data-[active=true]:text-duo-blue data-[active=true]:border-duo-macaw`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-5 w-5 ${item.color} group-data-[active=true]:text-duo-blue`} />
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

      <SidebarFooter className="p-4 pt-0 space-y-4">
        <SidebarMenu className="gap-2">
            <SidebarMenuItem>
                <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                    className="h-12 rounded-2xl transition-all border-2 border-transparent uppercase font-black text-xs tracking-wider hover:bg-duo-polar hover:border-duo-swan data-[active=true]:bg-duo-polar data-[active=true]:border-duo-swan"
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
                    className="h-12 rounded-2xl transition-all border-2 border-transparent uppercase font-black text-xs tracking-wider hover:bg-duo-red/10 hover:border-duo-cardinal hover:text-duo-red text-duo-wolf"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex flex-col gap-4 p-2">
          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
            <ThemeToggle />
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="h-3 w-3 rounded-full bg-duo-green animate-pulse shadow-[0_0_8px_rgba(88,204,2,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-green">Synced</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

