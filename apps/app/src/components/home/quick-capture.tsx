"use client";

import {
  BookOpen,
  Mic,
  Upload,
  Link,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CaptureCard {
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

const cards: CaptureCard[] = [
  { label: "Write Journal", icon: BookOpen, shortcut: "⌘J" },
  { label: "Record Voice", icon: Mic, shortcut: "⌘⇧V" },
  { label: "Upload File", icon: Upload, shortcut: "⌘U" },
  { label: "Save Link", icon: Link },
  { label: "Ask Debo", icon: MessageSquare, shortcut: "⌘A" },
];

export function QuickCapture() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Quick Capture
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => toast.info("Coming soon")}
            className={cn(
              "flex flex-col items-center justify-center gap-2.5",
              "rounded-2xl border-2 border-border bg-card p-5",
              "transition-all duration-200",
              "hover:border-primary/40 hover:shadow-sm",
              "active:scale-[0.97] cursor-pointer"
            )}
          >
            <card.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground">
              {card.label}
            </span>
            {card.shortcut && (
              <span className="text-[11px] font-mono text-muted-foreground/70">
                {card.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
