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
        <SidebarInset className="relative flex h-svh flex-col overflow-hidden bg-background md:peer-data-[variant=inset]:m-4 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-[2.5rem] md:peer-data-[variant=inset]:shadow-[0_0_40px_rgba(0,0,0,0.05)] md:peer-data-[variant=inset]:border-4 md:peer-data-[variant=inset]:border-duo-swan/20">
          {/* Dashboard Header */}
          <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b-2 border-duo-swan/20 bg-background/80 px-6 backdrop-blur-xl lg:px-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="flex md:hidden text-duo-wolf hover:text-duo-eel" />
              <div className="flex flex-col">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-wolf/40">
                  Dashboard
                </div>
                <h2 className="font-heading text-xl font-black tracking-tight text-duo-eel">
                  Overview
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border-2 border-duo-swan/30 bg-duo-polar px-3 py-1.5 md:flex">
                <Search className="h-4 w-4 text-duo-wolf/40" />
                <span className="text-xs font-bold text-duo-wolf/40">Search anything...</span>
                <kbd className="ml-2 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-duo-wolf/20 border-b-2 border-duo-swan">⌘K</kbd>
              </div>
              
              <Button variant="duolingo-outline" size="icon" className="rounded-2xl h-10 w-10">
                <Bell className="h-5 w-5" />
              </Button>
              
              <Button variant="duolingo" className="hidden h-10 gap-2 rounded-2xl px-4 text-xs sm:flex">
                <Plus className="h-4 w-4 stroke-[3]" />
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
