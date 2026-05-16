import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";

import { LaunchPreview } from "@/components/landing/LaunchPreview";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const isPublicPreviewDeploy = process.env.NODE_ENV === "production";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isPublicPreviewDeploy) {
    return <LaunchPreview label="Debo Dashboard" />;
  }

  const { resolveUserId } = await import("@/actions/auth-sync");
  const userId = await resolveUserId(undefined, true);

  if (!userId) {
    redirect("/join");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative flex h-svh flex-col overflow-hidden bg-background">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b-2 border-border bg-background/80 px-6 backdrop-blur-xl lg:px-10">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="flex md:hidden text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex flex-col gap-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/40">
                Debo Studio
              </div>
              <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                Overview
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DashboardSearch />

            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 border-2 border-border hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>

            <Button asChild className="hidden h-9 gap-1.5 rounded-xl px-4 text-xs font-extrabold uppercase tracking-wide sm:inline-flex minimal-btn-primary">
              <Link href="/dashboard/journal/text/new">
                <Plus className="h-3.5 w-3.5" />
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
