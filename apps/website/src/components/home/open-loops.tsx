"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
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
  const [loops, setLoops] = useState<OpenLoop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.tasks
      .list("inbox")
      .then((data: unknown) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : [];
        const mapped: OpenLoop[] = arr.slice(0, 5).map((task: any) => ({
          id: String(task.id),
          text: String(task.title || task.description || "Untitled task"),
        }));
        setLoops(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDone = async (id: string) => {
    setLoops((prev) => prev.filter((l) => l.id !== id));
    try {
      await api.tasks.approve(id);
      toast.success("Marked as done");
    } catch {
      toast.error("Could not update task");
    }
  };

  const handleAsk = (text: string) => {
    router.push(`/dashboard/ask?q=${encodeURIComponent(text)}`);
  };

  return (
    <Card className="rounded-2xl border-2 border-border bg-card p-0 h-full">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">
              Open loops
            </h2>
            {!loading && loops.length > 0 && (
              <Badge
                variant="outline"
                className="rounded-full text-[10px] px-1.5 py-0 border-amber-300 text-amber-600 dark:text-amber-400 dark:border-amber-500/40 h-5"
              >
                {loops.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => router.push("/dashboard/inbox")}
            className="text-muted-foreground rounded-lg"
          >
            View all
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-6">
            <Loader2 className="size-3.5 animate-spin" />
            Loading loops...
          </div>
        ) : error ? (
          <p className="text-xs text-muted-foreground py-6">
            Couldn&apos;t load tasks.
          </p>
        ) : loops.length === 0 ? (
          <div className="flex flex-col items-center text-center py-6 gap-2">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              All caught up. Nothing to triage.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {loops.map((loop) => (
              <li
                key={loop.id}
                className={cn(
                  "group flex items-start gap-2 rounded-lg px-2 py-1.5",
                  "hover:bg-accent/50 transition-colors"
                )}
              >
                <button
                  onClick={() => handleDone(loop.id)}
                  className={cn(
                    "shrink-0 mt-0.5 size-4 rounded-full border-2 border-border",
                    "hover:border-primary hover:bg-primary/10 transition-colors",
                    "flex items-center justify-center"
                  )}
                  aria-label="Mark done"
                >
                  <CheckCircle2 className="size-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="flex-1 text-sm text-foreground leading-snug min-w-0">
                  {loop.text}
                </p>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleAsk(loop.text)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-muted-foreground hover:text-foreground"
                  aria-label="Ask about this"
                >
                  <HelpCircle className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
