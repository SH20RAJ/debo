"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (!user) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="flex items-center gap-3 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6 border-b pb-4">
      <h2 className="text-2xl font-bold tracking-tight">
        Hi, {displayName}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground font-medium">
        {greeting}
      </p>
    </div>
  );
}
