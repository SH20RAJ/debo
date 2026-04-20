import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/join");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/50 bg-muted/20 p-4 flex flex-col justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md mb-8">
            <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Debo</span>
          </Link>
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
              Journals
            </Link>
            <Link href="/dashboard/settings" className="block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              Settings (BYOK)
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-between">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">Free edge tier</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
