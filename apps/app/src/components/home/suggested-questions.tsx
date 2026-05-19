"use client";

import { useRouter } from "next/navigation";
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
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Suggested Asks
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <button
            key={question}
            onClick={() =>
              router.push(`/dashboard/chat?q=${encodeURIComponent(question)}`)
            }
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-full",
              "text-sm font-medium text-foreground",
              "border-2 border-border bg-card",
              "transition-all duration-200",
              "hover:border-primary/40 hover:bg-primary/5",
              "active:scale-[0.97] cursor-pointer"
            )}
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}
