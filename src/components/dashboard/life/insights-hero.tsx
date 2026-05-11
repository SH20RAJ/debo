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
          className="duo-card hover-bounce flex flex-col justify-between p-7 min-h-[220px] transition-all duration-300 group"
        >
          <div className="flex items-start justify-between">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl border-b-4 transition-transform group-hover:scale-110",
              card.surface,
              card.surface.replace('border-', 'border-b-') // Make bottom border thicker for 3D effect
            )}>
              <card.icon className={cn("h-7 w-7", card.color)} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-duo-wolf/60">
              {card.label}
            </div>
          </div>
          <div className="space-y-2">
            <div className={cn("text-3xl font-black tracking-tight drop-shadow-sm", card.color)}>
              {card.value}
            </div>
            <div className="text-sm font-bold text-duo-wolf">
              {card.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
