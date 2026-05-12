import { resolveUserId } from "@/actions/auth-sync";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Metadata } from "next";
import { Search, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await resolveUserId(undefined, true);

  if (!userId) {
    redirect("/join");
  }

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative flex h-svh flex-col overflow-hidden bg-background md:peer-data-[variant=inset]:m-4 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-[3rem] md:peer-data-[variant=inset]:shadow-[0_0_80px_rgba(0,0,0,0.08)] md:peer-data-[variant=inset]:border-4 md:peer-data-[variant=inset]:border-border/40">
          {/* Dashboard Header */}
          <header className="sticky top-0 z-30 flex h-24 w-full items-center justify-between border-b-2 border-border/20 bg-background/60 px-8 backdrop-blur-2xl lg:px-12">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="flex md:hidden text-muted-foreground hover:text-foreground transition-colors" />
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
                  Dashboard
                </div>
                <h2 className="font-heading text-2xl font-black tracking-tight text-foreground">
                  Overview
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 rounded-2xl border-2 border-border/50 bg-muted/30 px-4 py-2 transition-all focus-within:border-duo-macaw focus-within:bg-card md:flex shadow-inner">
                <Search className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-xs font-bold text-muted-foreground/40">Search anything...</span>
                <kbd className="ml-4 rounded-lg bg-card px-2 py-1 text-[10px] font-black text-muted-foreground/30 border-b-2 border-border shadow-sm">⌘K</kbd>
              </div>
              
              <Button variant="duolingo-outline" size="icon" className="rounded-2xl h-11 w-11 shadow-sm border-2">
                <Bell className="h-5.5 w-5.5" />
              </Button>
              
              <Button variant="duolingo" className="hidden h-11 gap-2 rounded-2xl px-6 text-xs font-black uppercase tracking-wider sm:flex">
                <Plus className="h-5 w-5 stroke-[4]" />
                <span>New Journal</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}

export const metadata: Metadata = {
  title: "Debo Studio",
  description:
    "Debo Studio: capture journals, chat, review memory, and connect your assistant workflows.",
};
