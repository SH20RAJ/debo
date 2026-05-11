# Insights Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the `/dashboard/insights` page to show "Cognitive Analysis" hero cards for Top Person, Emotional Tone, and Topic Signal.

**Architecture:** Use a Server Component (`InsightsPage`) to fetch data from `queryGraph`, and Client Components for the interactive "Hero Cards" and detailed "Pattern List".

**Tech Stack:** Next.js (App Router), TypeScript, Lucide React, Tailwind CSS.

---

### Task 1: Create Shared Insight Types

**Files:**
- Create: `src/types/insights.ts`

- [ ] **Step 1: Define the Insight data types**

```typescript
export type RankedNode = {
  type: "person" | "topic" | "emotion" | "event";
  name: string;
  score?: number;
};

export type Pattern = {
  entity: string;
  count: number;
};

export type InsightSnapshot = {
  topPerson: RankedNode | null;
  topEmotion: RankedNode | null;
  topTopic: RankedNode | null;
  patterns: Pattern[];
  journalCount: number;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types/insights.ts
git commit -m "feat(insights): add shared types"
```

---

### Task 2: Create Insights Hero Component

**Files:**
- Create: `src/components/dashboard/life/insights-hero.tsx`

- [ ] **Step 1: Implement the Hero Cards component**

```tsx
"use client";

import { Link2, Smile, Zap, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankedNode } from "@/types/insights";

interface InsightsHeroProps {
  topPerson: RankedNode | null;
  topEmotion: RankedNode | null;
  topTopic: RankedNode | null;
}

export function InsightsHero({ topPerson, topEmotion, topTopic }: InsightsHeroProps) {
  const cards = [
    {
      label: "Most Mentioned",
      value: topPerson?.name || "No one yet",
      icon: Link2,
      color: "text-duo-macaw",
      surface: "border-duo-macaw bg-duo-macaw/10",
      detail: "Who you think about most",
    },
    {
      label: "Emotional Tone",
      value: topEmotion?.name || "Tired",
      icon: Smile,
      color: "text-duo-cardinal",
      surface: "border-duo-cardinal bg-duo-red/10",
      detail: "Your dominant feeling",
    },
    {
      label: "Topic Signal",
      value: topTopic?.name || "Journal",
      icon: Zap,
      color: "text-duo-fox",
      surface: "border-duo-fox bg-duo-orange/10",
      detail: "Strongest recurring theme",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="duo-card hover-bounce flex flex-col justify-between p-6 min-h-[200px]"
        >
          <div className="flex items-start justify-between">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border-2", card.surface)}>
              <card.icon className={cn("h-6 w-6", card.color)} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">
              {card.label}
            </div>
          </div>
          <div className="space-y-1">
            <div className={cn("text-2xl font-black tracking-tight", card.color)}>
              {card.value}
            </div>
            <div className="text-xs font-bold text-duo-wolf">
              {card.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/life/insights-hero.tsx
git commit -m "feat(insights): add InsightsHero component"
```

---

### Task 3: Create Pattern List Component

**Files:**
- Create: `src/components/dashboard/life/pattern-list.tsx`

- [ ] **Step 1: Implement the Mention Counts / Patterns list**

```tsx
"use client";

import { BrainCircuit } from "lucide-react";
import type { Pattern } from "@/types/insights";

export function PatternList({ patterns }: { patterns: Pattern[] }) {
  return (
    <div className="duo-card overflow-hidden">
      <div className="p-6 border-b-2 border-duo-swan bg-duo-polar">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-duo-macaw" />
          <div className="text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            Mention Counts
          </div>
        </div>
      </div>
      <div className="divide-y-2 divide-duo-swan">
        {patterns.length > 0 ? (
          patterns.map((p) => (
            <div key={p.entity} className="flex items-center justify-between p-6 hover:bg-duo-polar/50 transition-colors">
              <span className="font-black text-duo-eel">{p.entity}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-duo-wolf uppercase tracking-wider">{p.count}x</span>
                <div className="h-3 w-24 rounded-full bg-duo-swan overflow-hidden">
                  <div 
                    className="h-full bg-duo-macaw shadow-[0_2px_0_var(--duo-macaw-shadow)]" 
                    style={{ width: `${Math.min(100, (p.count / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-duo-swan font-bold">
            No patterns found yet. Keep writing!
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/life/pattern-list.tsx
git commit -m "feat(insights): add PatternList component"
```

---

### Task 4: Refactor Insights Page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/insights/page.tsx`

- [ ] **Step 1: Update the page to use new components and requested headers**

```tsx
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

import { queryGraph, refreshMemoryGraph } from "@/lib/life/graph";
import { getJournalsCount } from "@/actions/journals";
import { InsightsHero } from "@/components/dashboard/life/insights-hero";
import { PatternList } from "@/components/dashboard/life/pattern-list";
import { BrainCircuit, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Insights",
  description: "Cognitive analysis of your journal patterns.",
};

export default async function InsightsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const journalCount = await getJournalsCount();
  let graph = await queryGraph(
    "What do I work on most, who do I meet most, and what stresses me?",
    user.id,
  );

  if (!graph.topPeople.length && journalCount > 0) {
    await refreshMemoryGraph(user.id);
    graph = await queryGraph(
      "What do I work on most, who do I meet most, and what stresses me?",
      user.id,
    );
  }

  // Map to new types
  const topPerson = graph.topPeople[0] || null;
  const topEmotion = graph.topEmotions[0] || null;
  const topTopic = graph.topTopics[0] || null;

  return (
    <div className="flex-1 bg-duo-polar">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-12 lg:px-8">
        <header className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-snow px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-duo-wolf">
            <BrainCircuit className="h-4 w-4 text-duo-macaw" />
            Cognitive Analysis
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-duo-eel md:text-6xl">
              AI Insights
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-relaxed text-duo-wolf">
              Debo looks at your daily notes to show you the people, topics, and feelings that appear most often.
            </p>
          </div>
        </header>

        <InsightsHero 
          topPerson={topPerson} 
          topEmotion={topEmotion} 
          topTopic={topTopic} 
        />

        <div className="space-y-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            Life Patterns
          </div>
          <PatternList patterns={graph.patterns} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/dashboard/insights/page.tsx
git commit -m "feat(insights): rebuild insights page with hero cards"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: No new errors in insights files.

- [ ] **Step 2: Cleanup redundant component**

Run: `rm src/components/dashboard/life/life-insights.tsx` (If no longer used elsewhere)
Note: Check if `LifeInsights` is used in other pages before deleting.

```bash
grep -r "LifeInsights" src/
```

- [ ] **Step 3: Commit cleanup**

```bash
git rm src/components/dashboard/life/life-insights.tsx
git commit -m "cleanup: remove old life-insights component"
```
