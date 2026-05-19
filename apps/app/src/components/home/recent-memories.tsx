"use client";

import { MemoryCard } from "./memory-card";
import type { MemoryCardProps } from "./memory-card";

const mockMemories: MemoryCardProps[] = [
  {
    sourceType: "voice",
    title: "Marketing Sync",
    summary:
      "You discussed Q4 allocation and promised Raj a finalized draft by Friday.",
    date: "Tuesday",
    people: ["Raj"],
    taskCount: 1,
  },
  {
    sourceType: "file",
    title: "Q4 Allocation Draft",
    summary: "Budget spreadsheet with department-wise allocation breakdown.",
    date: "2 days ago",
    taskCount: 0,
  },
  {
    sourceType: "journal",
    title: "Product Ideas",
    summary:
      "Five ideas around memory graph visualization and voice-first capture.",
    date: "May 12",
    taskCount: 2,
  },
  {
    sourceType: "voice",
    title: "Customer Call",
    summary:
      "Sarah shared feedback on onboarding flow. Wants simpler first-run experience.",
    date: "Yesterday",
    people: ["Sarah"],
    taskCount: 1,
  },
];

export function RecentMemories() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
        Recent Memories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {mockMemories.map((memory, i) => (
          <MemoryCard key={i} {...memory} />
        ))}
      </div>
    </section>
  );
}
