"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [isGettingStarted, setIsGettingStarted] = useState(false);

  return (
    <section className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        The AI Companion<br />
        <span className="text-muted-foreground">That Remembers.</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
        Debo transforms simple text entries into an intelligent, context-aware AI companion using your daily journals and 130+ app connections.
      </p>
      
      <div className="flex gap-4">
        <Button 
          size="lg" 
          onClick={() => setIsGettingStarted(true)}
          disabled={isGettingStarted}
        >
          {isGettingStarted ? "Loading..." : "Get Started Now"}
        </Button>
        <Button variant="outline" size="lg">
          View Open Source
        </Button>
      </div>
    </section>
  );
}
