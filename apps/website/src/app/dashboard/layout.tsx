"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { CommandMenu } from "@/components/app-shell/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

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
      setSidebarCollapsed(e.matches);
      if (e.matches) setMobileOpen(false);
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <TooltipProvider>
      <Suspense fallback={null}>
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
            <main className="flex-1 overflow-auto">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
          </div>

          <CommandMenu open={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />
        </div>
      </Suspense>
    </TooltipProvider>
  );
}
