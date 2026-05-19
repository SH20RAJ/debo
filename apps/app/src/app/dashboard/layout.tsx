import Link from "next/link";
import { MessageSquare, Settings, LayoutDashboard } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/" className="text-lg font-bold text-primary">Debo</Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavLink href="/dashboard/chat" icon={MessageSquare} label="Chat" />
          <NavLink href="/dashboard/settings" icon={Settings} label="Settings" />
        </nav>
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
