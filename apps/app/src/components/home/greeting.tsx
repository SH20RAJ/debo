"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <section className="mb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">
          {greeting}, Shaswat.
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="default"
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              "bg-primary text-primary-foreground",
              "shadow-[0_2px_0_var(--primary-foreground,rgba(0,0,0,0.15))]"
            )}
          >
            3 new memories
          </Badge>
          <span className="text-muted-foreground text-sm">
            waiting for review.
          </span>
        </div>
      </div>
    </section>
  );
}
