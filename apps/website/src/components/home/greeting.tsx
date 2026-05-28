"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  const user = useUser();
  const [greeting, setGreeting] = useState("Good morning");
  const [inboxCount, setInboxCount] = useState<number | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    api.tasks
      .list("inbox")
      .then((data: any) => setInboxCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setInboxCount(0));
  }, []);

  const displayName =
    user?.displayName || user?.primaryEmail?.split("@")[0] || "there";

  return (
    <section className="mb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">
          {greeting}, {displayName}.
        </h1>
        {inboxCount !== null && inboxCount > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="default"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                "bg-primary text-primary-foreground",
                "shadow-[0_2px_0_var(--primary-foreground,rgba(0,0,0,0.15))]"
              )}
            >
              {inboxCount} new {inboxCount === 1 ? "memory" : "memories"}
            </Badge>
            <span className="text-muted-foreground text-sm">
              waiting for review.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
