"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const suggestions = [
  "What did I promise Raj?",
  "Summarize my last 7 days",
  "What tasks are hidden in my notes?",
];

export function SuggestedQuestions() {
  const router = useRouter();

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 font-[var(--font-nunito)]">
        Suggested Asks
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <Button
            key={question}
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/chat?q=${encodeURIComponent(question)}`)
            }
            className={cn(
              "rounded-full px-4 py-2 h-auto text-sm font-medium",
              "border-2 border-border bg-card text-foreground",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 hover:bg-primary/5",
              "active:translate-y-0 active:shadow-sm"
            )}
          >
            {question}
          </Button>
        ))}
      </div>
    </section>
  );
}
