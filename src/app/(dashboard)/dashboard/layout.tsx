import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Metadata } from "next";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { CopilotChat } from "@/components/copilot/CopilotChat";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/join");
  }

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background relative">
          <header className="flex h-14 shrink-0 items-center gap-2 px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/40 bg-background sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <CopilotChat />
        </SidebarInset>
      </SidebarProvider>
    </CopilotKit>
  );
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Debo dashboard: explore insights, timeline, and your memory graph.",
};
