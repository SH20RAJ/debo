"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
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
  const [memories, setMemories] = useState<MemoryCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.sources
      .list()
      .then((data: unknown) => {
        if (cancelled) return;
        const items = Array.isArray(data)
          ? data
          : (data as any)?.sources ?? (data as any)?.data ?? [];
        setMemories((items as any[]).slice(0, 8).map(normalizeSource));
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

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground font-[var(--font-nunito)]">
          Recent memories
        </h2>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => router.push("/dashboard/library")}
          className="rounded-lg text-muted-foreground"
        >
          Library
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl border-2 border-border bg-card h-36",
                "animate-pulse"
              )}
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground py-4">
          Could not load memories.
        </p>
      ) : memories.length === 0 ? (
        <div
          className={cn(
            "rounded-2xl border-2 border-dashed border-border bg-card/40",
            "p-6 text-center"
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
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {memories.map((m, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 w-[78%] first:ml-0"
                >
                  <MemoryCard {...m} />
                </div>
              ))}
            </div>
          </div>
          {/* Tablet/desktop grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
            {memories.slice(0, 4).map((m, i) => (
              <MemoryCard key={i} {...m} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
