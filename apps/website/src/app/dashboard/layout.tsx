"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { CommandMenu } from "@/components/app-shell/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  // Load sidebar collapse preference on mount
  useEffect(() => {
    if (window.innerWidth >= 768) {
      const stored = localStorage.getItem("debo-sidebar-collapsed");
      if (stored !== null) {
        setSidebarCollapsed(stored === "true");
      }
    }
  }, []);

  // Ctrl+K / Cmd+K to open command menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setSidebarCollapsed(true);
        setMobileOpen(false);
      } else {
        const stored = localStorage.getItem("debo-sidebar-collapsed");
        setSidebarCollapsed(stored === "true");
      }
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <TooltipProvider>
      <Suspense fallback={null}>
        <DashboardLayoutContent
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          commandMenuOpen={commandMenuOpen}
          setCommandMenuOpen={setCommandMenuOpen}
        >
          {children}
        </DashboardLayoutContent>
      </Suspense>
    </TooltipProvider>
  );
}

function DashboardLayoutContent({
  children,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  commandMenuOpen,
  setCommandMenuOpen,
}: {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  commandMenuOpen: boolean;
  setCommandMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFocused = searchParams.get("focus") === "true" && pathname === "/dashboard/journal";

  const noGlobalScroll = [
    "/dashboard/journal",
    "/dashboard/chat",
    "/dashboard/mail",
    "/dashboard/inbox",
    "/dashboard/voice",
    "/dashboard/library",
    "/dashboard/projects",
    "/dashboard/tasks",
    "/dashboard/mcp",
  ].some(p => pathname.startsWith(p)) || isFocused;

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && !isFocused && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {!isFocused && (
        <div
          className={cn(
            "h-full",
            mobileOpen
              ? "fixed inset-y-0 left-0 z-40"
              : "hidden md:block"
          )}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => {
              if (window.innerWidth < 768) {
                setMobileOpen((prev) => !prev);
              } else {
                setSidebarCollapsed((prev) => {
                  const next = !prev;
                  localStorage.setItem("debo-sidebar-collapsed", String(next));
                  return next;
                });
              }
            }}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {!isFocused && (
          <Topbar
            onCommandMenuOpen={() => setCommandMenuOpen(true)}
            onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
            onSidebarToggle={() => {
              setSidebarCollapsed((prev) => {
                const next = !prev;
                localStorage.setItem("debo-sidebar-collapsed", String(next));
                return next;
              });
            }}
            sidebarCollapsed={sidebarCollapsed}
          />
        )}
        <main
          className={cn(
            "flex-1 min-h-0",
            noGlobalScroll ? "overflow-hidden flex flex-col" : "overflow-y-auto"
          )}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </div>

      <CommandMenu open={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />
    </div>
  );
}
