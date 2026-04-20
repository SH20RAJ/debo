"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const [isGettingStarted, setIsGettingStarted] = useState(false);

  return (
    <section className="w-full pt-32 pb-24 md:pt-48 md:pb-32 bg-background">
      <div className="container mx-auto px-4 text-center flex flex-col items-center">
        <Badge variant="outline" className="mb-6 rounded-full px-3 py-1">
          Beta
        </Badge>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto text-foreground">
          The AI Companion That Remembers.
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
          Debo transforms simple text entries into an intelligent, context-aware AI ecosystem. Built strictly for minimalists.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            size="lg" 
            className="h-12 px-8"
            onClick={() => setIsGettingStarted(true)}
            disabled={isGettingStarted}
            asChild
          >
            <Link href="/join">
                {isGettingStarted ? "Loading..." : "Get Started Now"}
                <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12 px-8"
          >
            Explore Integrations
          </Button>
        </div>
      </div>
    </section>
  );
}
