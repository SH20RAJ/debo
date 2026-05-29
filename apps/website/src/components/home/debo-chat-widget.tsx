"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Loader2,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Thread {
  id: string;
  title: string | null;
  preview?: string | null;
  updatedAt?: string | null;
}

const FALLBACK_PROMPTS = [
  "Summarize my last 7 days",
  "What did I work on today?",
  "Find unfinished tasks in my notes",
];

function formatRelative(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DeboChatWidget() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.ask
      .listThreads()
      .then((data: unknown) => {
        if (cancelled) return;
        const arr = Array.isArray(data)
          ? data
          : (data as any)?.threads ?? (data as any)?.data ?? [];
        const mapped: Thread[] = (arr as any[]).slice(0, 3).map((t) => ({
          id: String(t.id),
          title: t.title ?? null,
          preview: t.lastMessage ?? t.preview ?? null,
          updatedAt: t.updatedAt ?? t.updated_at ?? t.createdAt ?? null,
        }));
        setThreads(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setThreads([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goAsk = (q?: string) => {
    if (q) router.push(`/dashboard/ask?q=${encodeURIComponent(q)}`);
    else router.push("/dashboard/ask");
  };

  const openThread = (id: string) => {
    router.push(`/dashboard/chat?threadId=${encodeURIComponent(id)}`);
  };

  const hasThreads = !loading && threads && threads.length > 0;

  return (
    <Card
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-0",
        "bg-gradient-to-br from-card to-primary/[0.03]"
      )}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="size-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">
              Ask Debo
            </h2>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => goAsk()}
            className="rounded-lg text-muted-foreground"
          >
            <MessageSquarePlus className="size-3.5" />
            New
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-6">
            <Loader2 className="size-3.5 animate-spin" />
            Loading threads...
          </div>
        ) : hasThreads ? (
          <div className="space-y-1.5">
            {threads!.map((t) => (
              <button
                key={t.id}
                onClick={() => openThread(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left",
                  "hover:bg-accent/50 transition-colors group"
                )}
              >
                <Sparkles className="size-3.5 text-primary/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">
                    {t.title || "Untitled chat"}
                  </p>
                  {t.preview && (
                    <p className="text-xs text-muted-foreground truncate">
                      {t.preview}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatRelative(t.updatedAt)}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 py-1">
            <p className="text-xs text-muted-foreground mb-2">
              Try asking your past:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FALLBACK_PROMPTS.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="xs"
                  onClick={() => goAsk(p)}
                  className={cn(
                    "rounded-full text-xs font-normal h-7 px-3",
                    "border-2 border-border text-muted-foreground",
                    "hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <Sparkles className="size-3 text-primary/60" />
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
