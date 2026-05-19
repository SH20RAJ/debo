"use client";

import { useEffect, useState } from "react";
import { MemoryCard } from "./memory-card";
import type { MemoryCardProps } from "./memory-card";
import { api } from "@/lib/api";

function normalizeSource(raw: any): MemoryCardProps {
  const sourceType = raw.sourceType ?? raw.type ?? "file";
  const safeType = ["voice", "journal", "file"].includes(sourceType)
    ? sourceType
    : "file";
  return {
    sourceType: safeType as MemoryCardProps["sourceType"],
    title: raw.title ?? "Untitled",
    summary: raw.summary ?? "",
    date: raw.date ?? formatRelativeDate(raw.createdAt),
    people: raw.people ?? [],
    taskCount: raw.taskCount ?? raw.task_count ?? 0,
  };
}

function formatRelativeDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentMemories() {
  const [memories, setMemories] = useState<MemoryCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchMemories() {
      try {
        const data = await api.sources.list();
        const items = Array.isArray(data) ? data : data?.sources ?? data?.data ?? [];
        if (!cancelled) {
          setMemories(items.slice(0, 4).map(normalizeSource));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchMemories();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
          Recent Memories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-border bg-card p-5 h-40 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error || memories.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
          Recent Memories
        </h2>
        <p className="text-sm text-muted-foreground">
          {error
            ? "Could not load memories. Make sure the API is running."
            : "No memories yet. Start capturing to see them here."}
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
        Recent Memories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {memories.map((memory, i) => (
          <MemoryCard key={i} {...memory} />
        ))}
      </div>
    </section>
  );
}
