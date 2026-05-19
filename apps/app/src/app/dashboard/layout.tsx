"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  // Pages with their own right rail should hide the default ContextRail
  const hideContextRail =
    pathname === "/dashboard/ask" ||
    pathname.startsWith("/dashboard/journal") ||
    pathname.startsWith("/dashboard/library");

  // ⌘K to open command menu
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

  // Collapse sidebar on small screens
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setSidebarCollapsed(e.matches);
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay when sidebar open */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          sidebarCollapsed
            ? "hidden md:block"
            : "fixed inset-y-0 left-0 z-40 md:relative"
        }
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onCommandMenuOpen={() => setCommandMenuOpen(true)} />

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 overflow-hidden">{children}</main>
          {!hideContextRail && <ContextRail />}
        </div>
      </div>

      {/* Command menu */}
      <CommandMenu
        open={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
      />
    </div>
  );
}
