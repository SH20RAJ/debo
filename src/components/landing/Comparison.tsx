"use client"

import { Brain, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

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
    <section id="comparison-section" className="py-32 bg-background border-t border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            The same conversation, <span className="text-primary/60 italic">twice.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            Standard AI models forget everything the moment you close the tab. <br className="hidden md:block" />
            Debo ensures your context lives forever.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-border/30 rounded-2xl border border-border shadow-sm overflow-hidden">
          
          {/* Without Debo */}
          <div className="bg-background p-8 md:p-12 flex flex-col h-full">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive/80">Standard AI</span>
              </div>
              <span className="text-[9px] font-medium text-muted-foreground/30 uppercase tracking-widest">No Context</span>
            </div>

            <div className="flex-grow space-y-10">
              <div className={`space-y-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-lg font-medium text-foreground leading-tight">
                  &ldquo;Anya has her chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">AI</div>
                <p className="text-lg font-medium text-foreground/40 italic">
                  &ldquo;Noted. I&apos;ll remember that.&rdquo;
                </p>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border/40" />
                </div>
                <span className="relative bg-background px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/20">Two Weeks Later</span>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-lg font-medium text-foreground">
                  &ldquo;What event is Anya preparing for?&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-destructive/60">AI</div>
                <p className="text-lg font-medium text-destructive/80 leading-relaxed italic">
                  &ldquo;I don&apos;t have that information. What is Anya doing?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/10 flex items-center gap-2 text-destructive/40">
              <XCircle className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Memory Loss</span>
            </div>
          </div>

          {/* With Debo */}
          <div className="bg-muted/20 p-8 md:p-12 flex flex-col h-full border-l border-border/30 relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain className="w-24 h-24 text-primary" />
             </div>

            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">Debo Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-primary/40" />
                <span className="text-[9px] font-semibold text-primary/60 uppercase tracking-widest">Active Recall</span>
              </div>
            </div>

            <div className="flex-grow space-y-10 relative z-10">
              <div className={`space-y-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-lg font-medium text-foreground leading-tight">
                  &ldquo;Anya has her chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">Debo</div>
                <p className="text-lg font-medium text-foreground">
                  &ldquo;Saved to <span className="text-primary font-semibold">Anya&apos;s context</span> under Chess Events.&rdquo;
                </p>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border/40" />
                </div>
                <span className="relative bg-muted/20 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/20">Two Weeks Later</span>
              </div>

              <div className={`space-y-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-lg font-medium text-foreground">
                  &ldquo;What event is Anya preparing for?&rdquo;
                </p>
              </div>

              <div className={`space-y-6 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-primary/80">Recalling Context</span>
                  </div>
                  <span className="text-[9px] font-medium text-primary/40 tracking-tighter">Verified</span>
                </div>
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  &ldquo;She&apos;s preparing for her first big <span className="text-primary font-semibold underline decoration-1 underline-offset-4 decoration-primary/30">chess tournament</span> on Oct 24th. Ready for a practice round?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/10 flex items-center gap-2 text-primary/60">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Context Preserved</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
