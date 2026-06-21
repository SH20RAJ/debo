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
    <div className="flex items-center justify-between py-2 border-b border-border/40 pb-4">
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Hi, {displayName}
        </h2>
        <p className="text-xs text-muted-foreground font-semibold mt-0.5">
          {greeting}
        </p>
      </div>
    </div>
  );
}
