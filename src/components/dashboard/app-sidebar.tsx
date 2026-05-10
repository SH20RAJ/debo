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
  ChevronRight,
  Sparkles,
  Zap,
  BarChart3,
  FileText,
  Plug,
  Brain,
  Clock,
  Terminal,
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

type SubItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const groups: { title: string; items: (NavItem | { type: 'submenu'; title: string; icon: React.ComponentType<{ className?: string }>; color: string; href: string; items: SubItem[] })[] }[] = [
  {
    title: "Main",
    items: [
      { title: "Home", href: "/dashboard", icon: Home, color: "text-duo-green", exact: true },
      {
        type: 'submenu',
        title: "Talk",
        href: "/dashboard/talk",
        icon: MessageSquareText,
        color: "text-duo-blue",
        items: [
          { title: "Ask", href: "/dashboard/ask", icon: Sparkles, color: "text-duo-purple" },
          { title: "Capture", href: "/dashboard/capture", icon: Mic2, color: "text-duo-orange" },
          { title: "Connectors", href: "/dashboard/connectors", icon: Plug, color: "text-duo-cyan" },
          { title: "Insights", href: "/dashboard/insights", icon: BarChart3, color: "text-duo-pink" },
          { title: "Journals", href: "/dashboard/journals", icon: Library, color: "text-duo-blue" },
          { title: "Timeline", href: "/dashboard/timeline", icon: Clock, color: "text-duo-yellow" },
        ]
      },
      { title: "MCP", href: "/dashboard/mcp", icon: Terminal, color: "text-duo-green" },
    ],
  },
  {
    title: "Memory",
    items: [
      { title: "Memories", href: "/dashboard/memories", icon: Database, color: "text-duo-green" },
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

  const isSubmenuOpen = (items: SubItem[]) => {
    return items.some(item => isActive(item.href));
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r-2 border-duo-swan bg-background">
      <SidebarHeader className="flex h-20 items-center px-5 gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors -ml-2" />
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
                {group.items.map((item: any) => {
                  if (item.type === 'submenu') {
                    const open = isSubmenuOpen(item.items);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive(item.href)}
                          tooltip={item.title}
                          className="h-12 rounded-2xl border-2 border-transparent text-xs font-black uppercase tracking-wider text-duo-wolf transition hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-blue/10 data-[active=true]:text-duo-blue"
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                            <span>{item.title}</span>
                            <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform group-data-[collapsible=icon]:hidden", open && "rotate-90")} />
                          </Link>
                        </SidebarMenuButton>
                        {open && (
                          <div className="ml-4 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
                            {item.items.map((subItem: SubItem) => (
                              <SidebarMenuButton
                                key={subItem.href}
                                asChild
                                isActive={isActive(subItem.href)}
                                tooltip={subItem.title}
                                className="h-10 rounded-xl border-0 text-xs font-bold uppercase tracking-wider text-duo-wolf/70 transition hover:text-duo-wolf hover:bg-duo-polar/50 data-[active=true]:bg-duo-blue/10 data-[active=true]:text-duo-blue"
                              >
                                <Link href={subItem.href} className="flex items-center gap-3">
                                  <subItem.icon className={`h-4 w-4 ${subItem.color}`} />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href, item.exact)}
                        tooltip={item.title}
                        className="h-12 rounded-2xl border-2 border-transparent text-xs font-black uppercase tracking-wider text-duo-wolf transition hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-blue/10 data-[active=true]:text-duo-blue"
                      >
                        <Link href={item.href}>
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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