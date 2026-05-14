import { resolveUserId } from "@/actions/auth-sync";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Metadata } from "next";
import Link from "next/link";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";


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
        <SidebarInset className="relative flex h-svh flex-col overflow-hidden bg-background ">
          {/* Dashboard Header */}
          <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/10 bg-background/60 px-8 backdrop-blur-2xl lg:px-12">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="flex md:hidden text-muted-foreground hover:text-foreground transition-colors" />
              <div className="flex flex-col gap-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">
                  Debo Studio
                </div>
                <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                  Overview
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DashboardSearch />
              
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border/20 hover:bg-muted/40">
                <Bell className="h-5 w-5 text-muted-foreground/60" />
              </Button>
              
              <Button asChild variant="default" className="hidden h-10 gap-2 rounded-xl px-5 text-xs font-semibold tracking-tight sm:flex bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                <Link href="/dashboard/journal/text/new">
                  <Plus className="h-4 w-4" />
                  <span>New Entry</span>
                </Link>
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
