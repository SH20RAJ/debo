"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, MessageCircle, BarChart3 } from "lucide-react";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--primary-muted),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.08),_transparent_40%)]" />
      
      <div className="container mx-auto max-w-6xl px-6 text-center">
        <div className="mb-8 flex justify-center">
          <Link 
            href="https://github.com/SH20RAJ/debo/issues/36" 
            className="group relative flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm transition-all hover:bg-primary/10 hover:border-primary/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Project Jarvis is announced
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        
        <p className="text-sm uppercase tracking-[0.28em] text-primary/70 font-medium">
          Memory, but operational.
        </p>
        
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] md:text-6xl lg:text-7xl">
          Debo turns your life into
          <span className="block mt-2 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            something you can query.
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Capture the day in plain language, then ask for the patterns, decisions, and moments that matter most.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isSignedIn ? (
            <Link href="/dashboard" aria-label="Enter Debo dashboard">
              <Button size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/25 sm:w-auto group">
                Enter Debo
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Link href="/join" aria-label="Start free - Build my life graph">
              <Button size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/25 sm:w-auto group">
                <Sparkles className="mr-2 w-4 h-4" />
                Start free — Build my life graph
              </Button>
            </Link>
          )}
          <Link href="#demo" aria-label="Try the demo - Ask a question">
            <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 text-base sm:w-auto hover:bg-primary/5">
              Ask: "What changed me this month?"
            </Button>
          </Link>
        </div>
        
        <p className="mt-4 text-sm text-muted-foreground">
          Built from your own data. Private by default. No noisy feed, no generic assistant.
        </p>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-xl mx-auto">
          {[
            { icon: Brain, label: "AI Memory" },
            { icon: MessageCircle, label: "Natural Ask" },
            { icon: BarChart3, label: "Patterns" },
            { icon: Sparkles, label: "Insights" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2.5">
              <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center opacity-50">
          <p className="text-xs italic tracking-widest uppercase text-muted-foreground">hope to be human</p>
        </div>
      </div>
    </section>
  );
}
