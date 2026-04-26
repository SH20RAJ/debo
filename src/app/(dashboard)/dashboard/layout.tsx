import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/join");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent flex flex-col h-screen overflow-hidden relative">
        {/* Ambient Background Mesh */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <header className="flex h-14 shrink-0 items-center gap-2 px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/10 bg-background/30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto h-full flex flex-col animate-in fade-in duration-500">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
