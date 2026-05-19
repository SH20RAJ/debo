"use client";

import { useEffect, useState } from "react";

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
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        {greeting}, Shaswat.
      </h1>
      <p className="mt-2 text-muted-foreground text-base">
        You have 3 new memories waiting for review.
      </p>
    </section>
  );
}
