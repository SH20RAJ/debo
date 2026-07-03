"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface OpenLoop {
  id: string;
  text: string;
}

export function OpenLoops() {
  const router = useRouter();
  const { data: rawTasks, isLoading, mutate } = useSWR(
    "/api/tasks?status=inbox",
    () => api.tasks.list({ status: "inbox" })
  );

  const tasksArr = Array.isArray(rawTasks) ? rawTasks : [];
  const loops: OpenLoop[] = tasksArr.slice(0, 5).map((task: any) => ({
    id: String(task.id),
    text: String(task.title || task.description || "Untitled task"),
  }));

  const handleDone = async (id: string) => {
    const next = tasksArr.filter((t: any) => String(t.id) !== id);
    mutate(next, false);
    try {
      await api.tasks.approve(id);
      toast.success("Marked as done");
      mutate();
    } catch {
      toast.error("Could not update task");
      mutate();
    }
  };

  const handleAsk = (text: string) => {
    router.push(`/dashboard/ask?q=${encodeURIComponent(text)}`);
  };

  return (
    <Card className="h-full">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Open loops</h2>
            {!isLoading && loops.length > 0 && <Badge variant="secondary">{loops.length}</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/inbox")}>
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : loops.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-md bg-muted">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All caught up. Nothing to triage.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {loops.map((loop) => (
              <li
                key={loop.id}
                className="group flex items-start gap-3 rounded-md px-2.5 py-2 hover:bg-muted transition-colors"
              >
                <button
                  onClick={() => handleDone(loop.id)}
                  className="mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-colors"
                  aria-label="Mark done"
                >
                  <CheckCircle2 className="size-3.5 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="flex-1 text-sm leading-snug min-w-0 font-medium">
                  {loop.text}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleAsk(loop.text)}
                  aria-label="Ask about this"
                >
                  <HelpCircle className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
