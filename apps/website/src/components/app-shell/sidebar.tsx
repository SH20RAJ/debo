"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@stackframe/stack";
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  UserRound,
  BookOpen,
  Mic,
  Phone,
  Video,
  Inbox,
  Plug,
  Shield,
  FileText,
  Clock,
  Library,
  CheckSquare,
  FolderKanban,
  Compass,
  Users,
  Radio,
  Cpu,
  LayoutGrid,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarPrefs, ALL_NAV_ITEMS, type SidebarItemDef } from "@/lib/sidebar-prefs";
import type { LucideIcon } from "lucide-react";

const ITEM_ICONS: Record<string, LucideIcon> = {
  home: LayoutDashboard,
  ask: MessageSquare,
  "second-brain": Brain,
  "digital-twin": UserRound,
  journal: BookOpen,
  voice: Mic,
  "voice-notes": Mic,
  "voice-talk": Phone,
  media: Video,
  mail: Inbox,
  connectors: Plug,
  vault: Shield,
  inbox: Inbox,
  debrief: FileText,
  timeline: Clock,
  library: Library,
  tasks: CheckSquare,
  projects: FolderKanban,
  decisions: Compass,
  people: Users,
  radar: Radio,
  mcp: Cpu,
  apps: LayoutGrid,
};

interface NavItem extends SidebarItemDef {
  icon: LucideIcon;
}

function resolveItems(itemIds: string[]): NavItem[] {
  return itemIds
    .map((id) => {
      const def = ALL_NAV_ITEMS.find((i) => i.id === id);
      if (!def) return null;
      return { ...def, icon: ITEM_ICONS[id] ?? Sparkles };
    })
    .filter((i): i is NavItem => i !== null);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { prefs, toggleSection } = useSidebarPrefs();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[active=true]:bg-transparent"
            >
              <Link href="/dashboard">
                <span className="text-base font-bold tracking-tight">debo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {prefs.sections.map((section) => {
          const items = resolveItems(section.itemIds);
          if (items.length === 0) return null;

          return (
            <SidebarGroup key={section.id}>
              <SidebarGroupLabel
                onClick={() => toggleSection(section.id)}
                className="cursor-pointer"
              >
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/settings")}
              tooltip="Settings"
            >
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarUser() {
  const router = usePathname();
  const sidebar = useSidebar();
  const user = useUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3 px-2 py-1.5">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const displayName = user.displayName || user.primaryEmail?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar className="size-7">
            {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-56">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            try {
              await user.signOut();
            } catch {
              window.location.href = "/handler/signout";
            }
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
