"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Brain, Sparkles, MessageSquare, Mic2 } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-duo-feather/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto max-w-4xl px-6">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-duo-feather/10 border border-duo-feather/20">
            <Sparkles className="h-4 w-4 text-duo-feather" />
            <span className="text-sm font-medium text-duo-feather">Life Intelligence System</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground leading-[1.1]">
            Remember your life with <span className="text-duo-feather">Debo</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Debo stores meaning, not just text. Ask questions about your past,
            detect patterns in your behavior, and turn memories into actionable insights.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-duo-feather hover:bg-duo-feather/90 shadow-lg shadow-duo-feather-shadow/20">
                <Link href="/dashboard" className="flex items-center gap-2">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-duo-feather hover:bg-duo-feather/90 shadow-lg shadow-duo-feather-shadow/20">
                  <Link href="/join">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl border-duo-swan">
                  <Link href="#features">See Features</Link>
                </Button>
              </>
            )}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground">
              <Brain className="h-4 w-4 text-duo-macaw" />
              AI Memory
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground">
              <MessageSquare className="h-4 w-4 text-duo-beetle" />
              Ask Your Life
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-duo-fox" />
              Pattern Detection
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground">
              <Mic2 className="h-4 w-4 text-duo-feather" />
              Voice Capture
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}