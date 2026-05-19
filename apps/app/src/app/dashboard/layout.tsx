"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { CommandMenu } from "@/components/app-shell/command-menu";
import { ContextRail } from "@/components/app-shell/context-rail";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [contextRailCollapsed, setContextRailCollapsed] = useState(false);

  const hideContextRail = pathname === "/dashboard/ask";

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

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setSidebarCollapsed(e.matches);
      if (e.matches) setMobileOpen(false);
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={
            mobileOpen
              ? "fixed inset-y-0 left-0 z-40"
              : sidebarCollapsed
                ? "hidden md:block"
                : "hidden md:block"
          }
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => {
              if (window.innerWidth < 768) {
                setMobileOpen((prev) => !prev);
              } else {
                setSidebarCollapsed((prev) => !prev);
              }
            }}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <Topbar
            onCommandMenuOpen={() => setCommandMenuOpen(true)}
            onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
          />
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 overflow-auto">{children}</main>
            {!hideContextRail && (
              <ContextRail
                collapsed={contextRailCollapsed}
                onToggle={() => setContextRailCollapsed((prev) => !prev)}
              />
            )}
          </div>
        </div>

        <CommandMenu open={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />
      </div>
    </TooltipProvider>
  );
}
