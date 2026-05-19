import { Card } from "@/components/card";
import { MessageSquare, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Your personal intelligence companion is ready.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="Chat"
          description="Talk to your AI companion"
          icon={MessageSquare}
          href="/dashboard/chat"
        />
        <Card
          title="Settings"
          description="Configure your AI provider"
          icon={Settings}
          href="/dashboard/settings"
        />
      </div>
    </div>
  );
}
