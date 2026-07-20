"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { CommandMenu } from "@/components/app-shell/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

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

  return (
    <Suspense fallback={null}>
      <DashboardLayoutContent setCommandMenuOpen={setCommandMenuOpen}>
        {children}
      </DashboardLayoutContent>
    </Suspense>
  );
}

function DashboardLayoutContent({
  children,
  setCommandMenuOpen,
}: {
  children: React.ReactNode;
  setCommandMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFocused = searchParams.get("focus") === "true" && pathname === "/dashboard/journal";
  const [commandMenuOpen, setOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {!isFocused && (
          <Topbar onCommandMenuOpen={() => setCommandMenuOpen(true)} />
        )}
        <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">{children}</div>
      </SidebarInset>

      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setOpen}
        onClose={() => setCommandMenuOpen(false)}
      />
    </SidebarProvider>
  );
}
