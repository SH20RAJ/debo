"use client";

import { Link2, Smile, Zap } from "lucide-react";
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
      label: "Social Hub",
      value: topPerson?.name || "No one yet",
      icon: Link2,
      color: "text-primary",
      surface: "border-primary/10 bg-primary/5",
      detail: "Most mentioned person",
    },
    {
      label: "Mood Signal",
      value: topEmotion?.name || "Equanimity",
      icon: Smile,
      color: "text-primary/80",
      surface: "border-primary/20 bg-primary/10",
      detail: "Most repeated feeling",
    },
    {
      label: "Main Topic",
      value: topTopic?.name || "General",
      icon: Zap,
      color: "text-primary/60",
      surface: "border-primary/5 bg-primary/5",
      detail: "Strongest recurring theme",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="minimal-card bg-card/40 border border-border/50 flex flex-col justify-between p-8 min-h-[220px] transition-all hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 group"
        >
          <div className="flex items-start justify-between">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl border border-transparent transition-all group-hover:scale-105",
              card.surface
            )}>
              <card.icon className={cn("h-7 w-7", card.color)} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
              {card.label}
            </div>
          </div>
          <div className="space-y-2">
            <div className={cn("text-3xl font-heading font-semibold tracking-tight", card.color)}>
              {card.value}
            </div>
            <div className="text-sm font-medium text-muted-foreground/40 italic leading-relaxed">
              {card.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
