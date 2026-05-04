import { resolveUserId } from "@/actions/auth-sync";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Metadata } from "next";
import { MyAssistantRuntimeProvider } from "@/components/assistant/AssistantRuntimeProvider";
import { MyAssistant } from "@/components/assistant/MyAssistant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await resolveUserId();

  if (!userId) {
    redirect("/join");
  }

  return (
    <MyAssistantRuntimeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background relative flex h-svh flex-col overflow-hidden">
          <header className="absolute top-0 left-0 w-full flex items-center gap-2 p-4 z-50 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-background/50 backdrop-blur-md rounded-md p-1">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            {children}
          </main>
          <MyAssistant />
        </SidebarInset>
      </SidebarProvider>
    </MyAssistantRuntimeProvider>
  );
}

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Debo dashboard: explore insights, timeline, and your memory graph.",
};
