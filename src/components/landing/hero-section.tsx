"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HeroSection() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground animate-bounce">
            <Sparkles className="h-3 w-3 text-primary" />
            Intelligence OS v1.1
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-foreground">
                Everything you forget, <span className="text-primary italic">Debo</span> remembers.
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground/80 font-medium max-w-2xl mx-auto leading-relaxed">
                The memory OS for thinkers and builders. One simple entry, infinite intelligence. Stop searching, start knowing.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/join" onClick={() => setIsLoading(true)}>
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-[1.03] transition-all group">
                    {isLoading ? "Synchronizing..." : "Start your second brain"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-16 px-8 rounded-full text-base font-bold text-muted-foreground hover:text-foreground">
                Watch it think
            </Button>
        </div>

        {/* Social Proof / Stats */}
        <div className="pt-12 flex items-center justify-center gap-8 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                130+ Integrations
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
            <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Zero Latency
            </div>
        </div>
      </div>
    </section>
  );
}
