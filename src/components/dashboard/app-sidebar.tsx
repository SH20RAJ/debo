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
  Plug,
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
      { title: "Home", href: "/dashboard", icon: Home, color: "text-duo-macaw", exact: true },
      {
        type: 'submenu',
        title: "Talk",
        href: "/dashboard/talk",
        icon: MessageSquareText,
        color: "text-duo-macaw",
        items: [
          { title: "Capture", href: "/dashboard/capture", icon: Mic2, color: "text-duo-feather" },
          { title: "Connectors", href: "/dashboard/connectors", icon: Plug, color: "text-duo-fox" },
          { title: "Insights", href: "/dashboard/insights", icon: BarChart3, color: "text-duo-bee" },
          { title: "Journals", href: "/dashboard/journals", icon: Library, color: "text-duo-macaw" },
          { title: "Timeline", href: "/dashboard/timeline", icon: Clock, color: "text-duo-humpback" },
        ]
      },
      { title: "MCP", href: "/dashboard/mcp", icon: Terminal, color: "text-duo-macaw" },
    ],
  },
  {
    title: "Memory",
    items: [
      { title: "Memories", href: "/dashboard/memories", icon: Database, color: "text-duo-macaw" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUser()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Automatically expand the submenu containing the active item
  React.useEffect(() => {
    const activeSubmenuHrefs = groups.flatMap(g => g.items)
      .filter(item => item.type === 'submenu' && item.items.some(sub => isActive(sub.href, false)))
      .map(item => item.href);
    
    if (activeSubmenuHrefs.length > 0) {
      setExpandedItems(prev => {
        const newItems = [...prev];
        activeSubmenuHrefs.forEach(href => {
          if (!newItems.includes(href)) newItems.push(href);
        });
        return newItems;
      });
    }
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isSubmenuOpen = (item: any) => {
    return expandedItems.includes(item.href);
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="border-r-4 border-duo-swan bg-background">
      <SidebarHeader className="flex h-24 items-center px-6 gap-4">
        <SidebarTrigger className="text-duo-wolf hover:text-duo-eel transition-colors -ml-2" />
        <Link href="/dashboard" className="flex items-center gap-3 w-full overflow-hidden whitespace-nowrap group">
          <div className="flex size-10 items-center justify-center rounded-2xl border-2 border-duo-macaw bg-duo-macaw/10 text-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)] transition-transform group-hover:-translate-y-0.5">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="font-heading text-3xl font-black tracking-tight text-duo-eel group-data-[collapsible=icon]:hidden">
            debo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-8 px-4 pt-4">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="mb-4 px-3 text-[11px] font-black uppercase tracking-[0.3em] text-duo-swan group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-3">
                {group.items.map((item: any) => {
                  if (item.type === 'submenu') {
                    const isOpen = isSubmenuOpen(item);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <div className="relative group/menu-item-container">
                          <SidebarMenuButton
                            isActive={isActive(item.href)}
                            tooltip={item.title}
                            className="h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-wolf transition-all hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-macaw/10 data-[active=true]:text-duo-macaw shadow-none active:translate-y-1 active:shadow-none pr-12"
                            asChild
                          >
                            <Link href={item.href} className="flex items-center gap-4 w-full">
                              <item.icon className={cn("h-6 w-6 transition-transform", isOpen && "scale-110")} />
                              <span className="flex-grow">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpand(item.href);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl hover:bg-duo-swan/20 transition-colors z-20 group-data-[collapsible=icon]:hidden"
                          >
                            <ChevronRight className={cn("h-5 w-5 transition-transform text-duo-swan", isOpen && "rotate-90 text-duo-macaw")} />
                          </button>
                        </div>
                        {isOpen && (
                          <div className="ml-6 mt-3 space-y-2 group-data-[collapsible=icon]:hidden border-l-2 border-duo-swan/30 pl-4 animate-in slide-in-from-left-2 duration-300">
                            {item.items.map((subItem: SubItem) => (
                              <SidebarMenuButton
                                key={subItem.href}
                                asChild
                                isActive={isActive(subItem.href)}
                                tooltip={subItem.title}
                                className="h-12 rounded-xl border-2 border-transparent text-xs font-black uppercase tracking-widest text-duo-wolf/60 transition-all hover:border-duo-swan/50 hover:bg-duo-polar data-[active=true]:border-duo-macaw/30 data-[active=true]:bg-duo-macaw/5 data-[active=true]:text-duo-macaw"
                              >
                                <Link href={subItem.href} className="flex items-center gap-3">
                                  <subItem.icon className="h-5 w-5" />
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
                        className="h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-wolf transition-all hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-macaw data-[active=true]:bg-duo-macaw/10 data-[active=true]:text-duo-macaw shadow-none active:translate-y-1 active:shadow-none"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-6 w-6" />
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

      <SidebarFooter className="space-y-4 p-4 pt-0">
        <SidebarMenu className="gap-3">
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/settings"}
                    tooltip="Settings"
                    className="h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-wolf transition-all hover:border-duo-swan hover:bg-duo-polar data-[active=true]:border-duo-swan data-[active=true]:bg-duo-swan/20"
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
                    className="h-14 rounded-2xl border-2 border-transparent text-[13px] font-black uppercase tracking-wider text-duo-cardinal transition-all hover:border-duo-cardinal hover:bg-duo-cardinal/10 shadow-none active:translate-y-1 active:shadow-none"
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
              <div className="h-2.5 w-2.5 rounded-full bg-duo-feather shadow-[0_0_8px_var(--duo-feather)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-duo-feather">Live Sync</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}