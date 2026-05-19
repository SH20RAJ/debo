import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import Link from "next/link";
import { MessageSquare, Settings, LayoutDashboard } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/handler/sign-in");

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-primary">Debo</h1>
          <p className="text-xs text-muted-foreground truncate">{user.primaryEmail}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavLink href="/dashboard/chat" icon={MessageSquare} label="Chat" />
          <NavLink href="/dashboard/settings" icon={Settings} label="Settings" />
        </nav>
        <div className="p-4 border-t border-border">
          <user.Button />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
