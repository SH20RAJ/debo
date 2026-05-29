"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function Greeting() {
  const user = useUser();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const displayName =
    user?.displayName?.split(" ")[0] ||
    user?.primaryEmail?.split("@")[0] ||
    "there";

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground font-medium">
        {greeting}, {displayName}
      </p>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-[var(--font-nunito)]">
        What&apos;s on your mind?
      </h1>
    </div>
  );
}
