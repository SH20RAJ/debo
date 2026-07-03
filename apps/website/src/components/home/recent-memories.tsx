"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryCard } from "./memory-card";
import type { MemoryCardProps } from "./memory-card";
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          Recent memories
        </h2>
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/library")}>
          Library
          <ArrowRight />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-md" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Could not load memories.
          </CardContent>
        </Card>
      ) : memories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No memories yet. Capture a thought above to start your timeline.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="-mx-4 px-4 sm:hidden">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
              {memories.map((m, i) => (
                <div key={i} className="snap-start w-[80%] shrink-0">
                  <MemoryCard {...m} />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-4">
            {memories.slice(0, 4).map((m, i) => (
              <MemoryCard key={i} {...m} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
