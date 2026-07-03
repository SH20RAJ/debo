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
import { Skeleton } from "@/components/ui/skeleton";
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

  const { data: rawThreads, isLoading } = useSWR(
    "/api/chat/threads",
    () => api.ask.listThreads()
  );

  const threadsArr = Array.isArray(rawThreads)
    ? rawThreads
    : (rawThreads as any)?.threads ?? (rawThreads as any)?.data ?? [];

  const threads: Thread[] = (threadsArr as any[]).slice(0, 3).map((t: any) => ({
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
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              <Brain className="size-4 text-foreground" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider">Ask Debo</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => goAsk()}>
            <MessageSquarePlus />
            New
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : hasThreads ? (
          <div className="space-y-1.5">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => openThread(t.id)}
                className="group flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left hover:bg-muted transition-colors"
              >
                <Sparkles className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t.title || "Untitled chat"}
                  </p>
                  {t.preview && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t.preview}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {formatRelative(t.updatedAt)}
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              Try asking your past:
            </p>
            <div className="flex flex-wrap gap-2">
              {FALLBACK_PROMPTS.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => goAsk(p)}
                >
                  <Sparkles className="text-muted-foreground" />
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
