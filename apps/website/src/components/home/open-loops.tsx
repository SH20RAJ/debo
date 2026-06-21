"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface OpenLoop {
  id: string;
  text: string;
}

export function OpenLoops() {
  const router = useRouter();

  // Fetch inbox tasks with SWR
  const { data: rawTasks, isLoading, error, mutate } = useSWR(
    "/api/tasks?status=inbox",
    () => api.tasks.list({ status: "inbox" })
  );

  const tasksArr = Array.isArray(rawTasks) ? rawTasks : [];
  const loops: OpenLoop[] = tasksArr.slice(0, 5).map((task: any) => ({
    id: String(task.id),
    text: String(task.title || task.description || "Untitled task"),
  }));

  const handleDone = async (id: string) => {
    // Optimistic cache update
    const nextRawTasks = tasksArr.filter((t: any) => String(t.id) !== id);
    mutate(nextRawTasks, false);

    try {
      await api.tasks.approve(id);
      toast.success("Marked as done");
      mutate(); // Trigger validation from server
    } catch {
      toast.error("Could not update task");
      mutate(); // Rollback
    }
  };

  const handleAsk = (text: string) => {
    router.push(`/dashboard/ask?q=${encodeURIComponent(text)}`);
  };

  return (
    <Card className="rounded-[1.75rem] border border-border/80 bg-card p-0 h-full shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-[var(--font-nunito)]">
              Open loops
            </h2>
            {!isLoading && loops.length > 0 && (
              <Badge
                variant="outline"
                className="rounded-full text-[10px] px-2 py-0 border-primary/30 text-primary font-bold bg-primary/5 h-5 flex items-center justify-center"
              >
                {loops.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => router.push("/dashboard/inbox")}
            className="text-muted-foreground hover:text-primary rounded-lg text-xs"
          >
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-8 justify-center">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading loops...
          </div>
        ) : error ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            Couldn&apos;t load tasks.
          </p>
        ) : loops.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
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
                className={cn(
                  "group flex items-start gap-3 rounded-2xl px-2.5 py-2",
                  "hover:bg-primary/5 transition-all duration-200"
                )}
              >
                <button
                  onClick={() => handleDone(loop.id)}
                  className={cn(
                    "shrink-0 mt-0.5 size-4.5 rounded-full border border-border bg-background",
                    "hover:border-primary hover:bg-primary/5 transition-colors",
                    "flex items-center justify-center cursor-pointer"
                  )}
                  aria-label="Mark done"
                >
                  <CheckCircle2 className="size-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="flex-1 text-sm text-foreground leading-snug min-w-0 font-medium group-hover:text-primary/95 transition-colors">
                  {loop.text}
                </p>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleAsk(loop.text)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-muted-foreground hover:text-primary hover:bg-transparent"
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
