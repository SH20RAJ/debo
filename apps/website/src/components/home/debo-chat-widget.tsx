"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Loader2,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";
import useSWR from "swr";
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

  // Fetch threads with SWR
  const { data: rawThreads, isLoading } = useSWR(
    "/api/chat/threads",
    () => api.ask.listThreads()
  );

  const threadsArr = Array.isArray(rawThreads)
    ? rawThreads
    : (rawThreads as any)?.threads ?? (rawThreads as any)?.data ?? [];

  const threads: Thread[] = threadsArr.slice(0, 3).map((t: any) => ({
    id: String(t.id),
    title: t.title ?? null,
    preview: t.lastMessage ?? t.preview ?? null,
    updatedAt: t.updatedAt ?? t.updated_at ?? t.createdAt ?? null,
  }));

  const goAsk = (q?: string) => {
    if (q) router.push(`/dashboard/ask?q=${encodeURIComponent(q)}`);
    else router.push("/dashboard/ask");
  };

  const openThread = (id: string) => {
    router.push(`/dashboard/chat/${encodeURIComponent(id)}`);
  };

  const hasThreads = !isLoading && threads.length > 0;

  return (
    <Card
      className={cn(
        "rounded-[1.75rem] border border-border/80 bg-card p-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
        "bg-gradient-to-br from-card to-primary/[0.02]"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="size-4.5 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-[var(--font-nunito)]">
              Ask Debo
            </h2>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => goAsk()}
            className="rounded-xl text-muted-foreground hover:text-primary text-xs"
          >
            <MessageSquarePlus className="size-3.5 mr-1" />
            New
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-8 justify-center">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading threads...
          </div>
        ) : hasThreads ? (
          <div className="space-y-1.5">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => openThread(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left",
                  "hover:bg-primary/5 transition-all group duration-200"
                )}
              >
                <Sparkles className="size-4 text-primary/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium group-hover:text-primary transition-colors">
                    {t.title || "Untitled chat"}
                  </p>
                  {t.preview && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {t.preview}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground shrink-0 bg-secondary px-2 py-0.5 rounded-full">
                  {formatRelative(t.updatedAt)}
                </span>
                <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Try asking your past:
            </p>
            <div className="flex flex-wrap gap-2">
              {FALLBACK_PROMPTS.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="xs"
                  onClick={() => goAsk(p)}
                  className={cn(
                    "rounded-full text-xs font-semibold h-8 px-4",
                    "border border-border/80 text-muted-foreground bg-card",
                    "hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                  )}
                >
                  <Sparkles className="size-3.5 text-primary mr-1.5" />
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
