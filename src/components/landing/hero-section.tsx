"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Search, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HeroSection() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-tight mb-4">
                <Sparkles className="h-4 w-4" />
                Introducing the Memory Engine
            </div>
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.85] text-foreground">
                AI that <br />
                <span className="text-primary italic">remembers</span> your life.
            </h1>
            <p className="text-xl md:text-3xl text-muted-foreground/60 font-medium max-w-3xl mx-auto leading-relaxed">
                Debo captures your thoughts and memories, then lets you ask anything about your past. It's your second brain, refined.
            </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 pt-4">
            <Link href="/join" onClick={() => setIsLoading(true)}>
                <Button size="lg" className="h-20 px-16 rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all group bg-primary text-primary-foreground border-4 border-primary-foreground/10">
                    {isLoading ? "Starting Engine..." : "Start your Memory Engine"}
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-12 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    Deep Journaling
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <div className="flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    Life Querying
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5" />
                    Persistent Memory
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
