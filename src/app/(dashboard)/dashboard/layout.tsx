import { resolveUserId } from "@/actions/auth-sync";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Metadata } from "next";


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
        <SidebarInset className="relative flex h-svh flex-col overflow-hidden bg-background">
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
