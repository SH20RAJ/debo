import { stackServerApp } from "@/stack/server";
import { Card } from "@/components/card";
import { MessageSquare, Brain, BookOpen } from "lucide-react";

export default async function DashboardPage() {
  const user = await stackServerApp.getUser();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        Welcome back, {user?.displayName || "there"}
      </h1>
      <p className="text-muted-foreground mb-8">
        Your personal intelligence companion is ready.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Chat"
          description="Talk to your AI companion"
          icon={MessageSquare}
          href="/dashboard/chat"
        />
        <Card
          title="Memories"
          description="Browse your memory graph"
          icon={Brain}
          href="/dashboard/memories"
        />
        <Card
          title="Journals"
          description="Read your journal entries"
          icon={BookOpen}
          href="/dashboard/journals"
        />
      </div>
    </div>
  );
}
