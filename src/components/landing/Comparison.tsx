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
    <section id="comparison-section" className="py-24 bg-background border-t-2 border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center mb-20 space-y-5">
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1]">
            The difference is <span className="text-primary">continuity.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground font-semibold leading-relaxed">
            Generic chat remembers a thread. Debo remembers the people, dates, and evidence across the life you actually captured.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-border/30 rounded-2xl border-2 border-border overflow-hidden">

          {/* Without Debo */}
          <div className="bg-background p-8 md:p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive/60" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-destructive/80">Standard AI</span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">No Context</span>
            </div>

            <div className="flex-grow space-y-8">
              <div className={`space-y-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-base font-semibold text-foreground leading-tight">
                  &ldquo;Anya has her chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-3 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/40">AI</div>
                <p className="text-base font-medium text-foreground/40 italic">
                  &ldquo;Noted. I&apos;ll remember that.&rdquo;
                </p>
              </div>

              <div className="relative py-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border/40" />
                </div>
                <span className="relative bg-background px-4 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/30">Two Weeks Later</span>
              </div>

              <div className={`space-y-3 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-base font-semibold text-foreground">
                  &ldquo;What event is Anya preparing for?&rdquo;
                </p>
              </div>

              <div className={`space-y-3 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-destructive/60">AI</div>
                <p className="text-base font-semibold text-destructive/80 leading-relaxed italic">
                  &ldquo;I don&apos;t have that information. What is Anya doing?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border/10 flex items-center gap-2 text-destructive/40">
              <XCircle className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Memory Loss</span>
            </div>
          </div>

          {/* With Debo */}
          <div className="bg-muted/20 p-8 md:p-10 flex flex-col h-full border-l border-border/30 relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain className="w-24 h-24 text-primary" />
             </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Debo Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-primary/40" />
                <span className="text-[9px] font-extrabold text-primary/60 uppercase tracking-widest">Active Recall</span>
              </div>
            </div>

            <div className="flex-grow space-y-8 relative z-10">
              <div className={`space-y-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-base font-semibold text-foreground leading-tight">
                  &ldquo;Anya has her chess tournament on Oct 24th. She&apos;s nervous.&rdquo;
                </p>
              </div>

              <div className={`space-y-3 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/40">Debo</div>
                <p className="text-base font-semibold text-foreground">
                  &ldquo;Saved to <span className="text-primary font-bold">Anya&apos;s profile</span> with the date and source attached.&rdquo;
                </p>
              </div>

              <div className="relative py-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border/40" />
                </div>
                <span className="relative bg-muted/20 px-4 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/30">Two Weeks Later</span>
              </div>

              <div className={`space-y-3 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/40">You</div>
                <p className="text-base font-semibold text-foreground">
                  &ldquo;What event is Anya preparing for?&rdquo;
                </p>
              </div>

              <div className={`space-y-5 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="px-4 py-2 rounded-xl bg-primary/5 border-2 border-primary/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">Recalling Context</span>
                  </div>
                  <span className="text-[9px] font-bold text-primary/40">Verified</span>
                </div>
                <p className="text-base font-semibold text-foreground leading-relaxed">
                  &ldquo;She&apos;s preparing for her first big <span className="text-primary font-bold underline decoration-2 underline-offset-4 decoration-primary/30">chess tournament</span> on Oct 24th. Ready for a practice round?&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border/10 flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Context Preserved</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
