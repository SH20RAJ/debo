"use client";

import { XCircle, CheckCircle2, Clock, Brain } from "lucide-react";
import { useEffect, useState } from "react";

export function Comparison() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById("comparison-section");
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="comparison-section" className="py-24 bg-background border-t border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-heading font-black text-foreground leading-tight">
            The same conversation, <span className="text-primary italic">twice.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground font-bold leading-relaxed">
            Standard AI models forget everything the moment you close the tab. <br className="hidden md:block" />
            Debo ensures your context lives forever.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-border/50 rounded-[3rem] border-4 border-border shadow-2xl shadow-black/5 overflow-hidden">
          
          {/* Without Debo */}
          <div className="bg-background p-8 md:p-12 flex flex-col h-full">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-destructive">Without Debo</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Recall</span>
            </div>

            <div className="flex-grow space-y-10">
              <div className={`space-y-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">You</div>
                <p className="text-lg font-bold text-foreground leading-tight">
                  &ldquo;My sister Anya has her first big chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Model</div>
                <p className="text-lg font-bold text-foreground opacity-60 italic">
                  &ldquo;Noted. I&apos;ll remember that for next time we talk.&rdquo;
                </p>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-border/20" />
                </div>
                <span className="relative bg-background px-4 text-xs font-black uppercase tracking-widest text-muted-foreground/40">Weeks later</span>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">You</div>
                <p className="text-lg font-bold text-foreground">
                  &ldquo;What should I get Anya for her upcoming event?&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">AI Model</div>
                <p className="text-lg font-bold text-destructive leading-relaxed">
                  &ldquo;Of course. What event is Anya preparing for?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-border/10 flex items-center gap-3 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Forgotten.</span>
            </div>
          </div>

          {/* With Debo */}
          <div className="bg-muted/50 p-8 md:p-12 flex flex-col h-full border-l-4 lg:border-l-0 lg:border-t-0 border-border relative">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Brain className="w-32 h-32 text-primary" />
             </div>

            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">With Debo</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Retrieved Instantly</span>
              </div>
            </div>

            <div className="flex-grow space-y-10 relative z-10">
              <div className={`space-y-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">You</div>
                <p className="text-lg font-bold text-foreground leading-tight">
                  &ldquo;My sister Anya has her first big chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Debo AI</div>
                <p className="text-lg font-bold text-foreground">
                  &ldquo;Noted. Added to <span className="text-primary">Anya&apos;s Profile</span> under Chess.&rdquo;
                </p>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-border/20" />
                </div>
                <span className="relative bg-muted px-4 text-xs font-black uppercase tracking-widest text-muted-foreground/40">Weeks later</span>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">You</div>
                <p className="text-lg font-bold text-foreground">
                  &ldquo;What should I get Anya for her upcoming event?&rdquo;
                </p>
              </div>

              <div className={`space-y-6 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="px-5 py-3 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Memory Retrieved</span>
                  </div>
                  <span className="text-[10px] font-black text-primary/50">12ms</span>
                </div>
                <p className="text-lg font-bold text-foreground leading-relaxed">
                  &ldquo;Anya&apos;s tournament is on Oct 24th! She mentioned wanting a <span className="text-primary underline decoration-2 underline-offset-4">weighted wooden board</span>. Should I find some options?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-border/10 flex items-center gap-3 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Remembered.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
