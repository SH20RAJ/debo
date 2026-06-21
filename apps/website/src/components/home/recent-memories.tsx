"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "./memory-card";
import type { MemoryCardProps } from "./memory-card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const VALID_KINDS: MemoryCardProps["sourceType"][] = ["voice", "journal", "file"];

function normalizeSource(raw: any): MemoryCardProps {
  const t = raw.sourceType ?? raw.type ?? "file";
  const safe: MemoryCardProps["sourceType"] = VALID_KINDS.includes(t)
    ? t
    : t === "audio"
    ? "voice"
    : "file";
  return {
    sourceType: safe,
    title: raw.title ?? "Untitled",
    summary: raw.summary ?? raw.description ?? "",
    date: raw.date ?? formatRelativeDate(raw.createdAt ?? raw.created_at),
    people: raw.people ?? [],
    taskCount: raw.taskCount ?? raw.task_count ?? 0,
  };
}

function formatRelativeDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentMemories() {
  const router = useRouter();

  // Fetch sources with SWR
  const { data: rawSources, isLoading, error } = useSWR(
    "/api/sources",
    () => api.sources.list()
  );

  const items = Array.isArray(rawSources)
    ? rawSources
    : (rawSources as any)?.sources ?? (rawSources as any)?.data ?? [];

  const memories: MemoryCardProps[] = items.slice(0, 8).map(normalizeSource);

  return (
    <section className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider font-[var(--font-nunito)]">
          Recent memories
        </h2>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => router.push("/dashboard/library")}
          className="rounded-xl text-muted-foreground hover:text-primary text-xs"
        >
          Library
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-[1.75rem] border border-border bg-card h-36",
                "animate-pulse"
              )}
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Could not load memories.
        </p>
      ) : memories.length === 0 ? (
        <div
          className={cn(
            "rounded-[1.75rem] border border-dashed border-border/80 bg-card/40",
            "p-8 text-center"
          )}
        >
          <p className="text-sm text-muted-foreground">
            No memories yet. Capture a thought above to start your timeline.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="-mx-4 px-4 sm:hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
              {memories.map((m, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 w-[80%] first:ml-0"
                >
                  <MemoryCard {...m} />
                </div>
              ))}
            </div>
          </div>
          {/* Tablet/desktop grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
            {memories.slice(0, 4).map((m, i) => (
              <MemoryCard key={i} {...m} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
