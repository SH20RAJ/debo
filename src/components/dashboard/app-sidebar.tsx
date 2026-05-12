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
  Sparkles,
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
  color: string;
  exact?: boolean;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Core",
    items: [
      { title: "Home", href: "/dashboard", icon: Home, color: "text-duo-macaw", exact: true },
      { title: "Chat", href: "/dashboard/chat", icon: MessageSquareText, color: "text-duo-macaw" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { title: "Insights", href: "/dashboard/insights", icon: BarChart3, color: "text-duo-bee" },
      { title: "Memories", href: "/dashboard/memories", icon: Database, color: "text-duo-macaw" },
    ],
  },
  {
    title: "Records",
    items: [
      { title: "Journals", href: "/dashboard/journals", icon: Library, color: "text-duo-macaw" },
      { title: "Timeline", href: "/dashboard/timeline", icon: Clock, color: "text-duo-humpback" },
    ],
  },
  {
    title: "Studio",
    items: [
      { title: "Talk", href: "/dashboard/talk", icon: Radio, color: "text-duo-macaw" },
      { title: "Capture", href: "/dashboard/capture", icon: Mic2, color: "text-duo-feather" },
      { title: "MCP", href: "/dashboard/mcp", icon: Terminal, color: "text-duo-macaw" },
      { title: "Connectors", href: "/dashboard/connectors", icon: Plug, color: "text-duo-fox" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUser()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r-4 border-duo-swan bg-duo-polar">
      <SidebarHeader className="flex h-28 items-center px-6 gap-4 border-b-2 border-duo-swan/30 mb-2">
        <SidebarTrigger className="text-duo-wolf hover:text-duo-eel transition-colors -ml-2 hover:bg-duo-swan/20" />
        <Link href="/dashboard" className="flex items-center gap-3 w-full overflow-hidden whitespace-nowrap group">
          <div className="flex size-11 items-center justify-center rounded-[1.25rem] border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw shadow-[0_5px_0_var(--duo-macaw-shadow)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_0_var(--duo-macaw-shadow)] active:translate-y-0.5 active:shadow-none">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-3xl font-black tracking-tight text-duo-eel leading-none">
              debo
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-macaw/60 mt-0.5">
              Intelligence
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-8 px-4 pt-4">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.35em] text-duo-wolf/40 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2.5 px-1">
                {group.items.map((item: any) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href, item.exact)}
                        tooltip={item.title}
                        className={cn(
                          "h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-wolf transition-all shadow-none",
                          "hover:border-duo-swan hover:bg-white hover:translate-y-[-2px] hover:shadow-[0_4px_0_var(--duo-swan)]",
                          "data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-macaw/10 data-[active=true]:text-duo-macaw data-[active=true]:shadow-[0_4px_0_var(--duo-macaw-shadow)] data-[active=true]:translate-y-[-2px]",
                          "active:translate-y-[2px] active:shadow-none"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isActive(item.href, item.exact) && "scale-110")} />
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

      <SidebarFooter className="space-y-4 p-4 pt-0">
        <SidebarMenu className="gap-2.5 px-1">
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                    className={cn(
                      "h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-wolf transition-all shadow-none",
                      "hover:border-duo-swan hover:bg-white hover:translate-y-[-2px] hover:shadow-[0_4px_0_var(--duo-swan)]",
                      "data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-macaw/10 data-[active=true]:text-duo-macaw data-[active=true]:shadow-[0_4px_0_var(--duo-macaw-shadow)] data-[active=true]:translate-y-[-2px]"
                    )}
                >
                    <Link href="/dashboard/settings">
                        <Settings className="h-6 w-6" />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => user?.signOut()}
                    tooltip="Sign Out"
                    className={cn(
                      "h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-cardinal transition-all shadow-none",
                      "hover:border-duo-cardinal hover:bg-duo-cardinal/10 hover:translate-y-[-2px] hover:shadow-[0_4px_0_var(--duo-cardinal-shadow)]",
                      "active:translate-y-[2px] active:shadow-none"
                    )}
                >
                    <LogOut className="h-6 w-6" />
                    <span>Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex flex-col gap-4 px-3 pb-2 border-t-2 border-duo-swan/30 pt-6">
          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
            <ThemeToggle />
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
              <div className="relative">
                <div className="h-2.5 w-2.5 rounded-full bg-duo-feather shadow-[0_0_8px_var(--duo-feather)]" />
                <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-duo-feather animate-ping opacity-75" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-duo-feather">Live Sync</span>
            </div>
          </div>
          <div className="relative flex items-center justify-center pt-2 group-data-[collapsible=icon]:hidden">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-bounce-subtle">
               <img src="/debo.png" alt="Debo Mascot" className="w-full h-full object-contain" />
            </div>
            <img src="/debo.png" alt="Debo Mascot" className="w-16 h-16 object-contain opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}