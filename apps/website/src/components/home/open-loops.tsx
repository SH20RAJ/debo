"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface OpenLoop {
  id: string;
  text: string;
  source: string;
}

export function OpenLoops() {
  const router = useRouter();
  const [loops, setLoops] = useState<OpenLoop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tasks.list("inbox")
      .then((data: any) => {
        const mapped: OpenLoop[] = (data ?? []).map((task: any) => ({
          id: task.id,
          text: task.title || task.description || "Untitled",
          source: "Task \u00b7 Inbox",
        }));
        setLoops(mapped);
      })
      .catch(() => setLoops([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDone = async (id: string) => {
    try {
      await api.tasks.approve(id);
      setLoops((prev) => prev.filter((l) => l.id !== id));
      toast.success("Marked as done");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleAsk = (text: string) => {
    router.push(`/dashboard/ask?q=${encodeURIComponent(text)}`);
  };

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
          Open Loops
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground font-[var(--font-nunito)]">
          Open Loops
        </h2>
        <Badge
          variant="outline"
          className="rounded-full text-[11px] px-2 py-0.5 border-amber-300 text-amber-600 dark:text-amber-400 dark:border-amber-500/40"
        >
          {loops.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {loops.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No open loops \u2014 all caught up!
          </p>
        ) : (
          loops.map((loop) => (
            <Card
              key={loop.id}
              className={cn(
                "rounded-2xl border-2 border-border bg-card p-0",
                "transition-all duration-200",
                "hover:border-amber-300/60 dark:hover:border-amber-500/30 hover:shadow-sm"
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {loop.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {loop.source}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDone(loop.id)}
                      className="text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark done
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleAsk(loop.text)}
                      className="text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Ask about this
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
