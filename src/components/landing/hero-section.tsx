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
      
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-foreground">
                The AI that <span className="text-primary">remembers</span> everything.
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground/60 font-medium max-w-2xl mx-auto leading-relaxed">
                Build your second brain with one simple link. <br className="hidden md:block" />
                Sync your thoughts and 130+ apps into one private OS.
            </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 pt-4">
            <Link href="/join" onClick={() => setIsLoading(true)}>
                <Button size="lg" className="h-16 px-12 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-[1.03] transition-all group bg-primary text-primary-foreground">
                    {isLoading ? "Synchronizing..." : "Start your second brain"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-8 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4" />
                    130+ Apps
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Encrypted
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
