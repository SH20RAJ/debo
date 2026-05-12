"use client";

import { Sparkles, User, Search, MessageSquare, Calendar, BarChart3, ClipboardList, PenTool, Lightbulb } from "lucide-react";

const useCases = [
  {
    persona: "Founders",
    question: "Why did we decide against the React migration in June?",
    answer: "Based on your voice note from June 12, the team decided to prioritize the mobile app performance audit instead, citing a lack of senior frontend capacity.",
    icon: Lightbulb,
    sources: "Voice note • June 12",
  },
  {
    persona: "Operators",
    question: "What were the next steps for Sarah?",
    answer: "You noted on Tuesday that Sarah needs the hiring plan by Friday and needs to follow up with the design team regarding the export UI.",
    icon: ClipboardList,
    sources: "Journal • Tuesday",
  },
  {
    persona: "Researchers",
    question: "What patterns are emerging in my user interviews?",
    answer: "Common themes include frustration with current export tools and a strong desire for more cited evidence in AI answers across all 12 recorded sessions.",
    icon: BarChart3,
    sources: "12 Voice Notes",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-4xl px-6 relative z-10">
        <div className="text-center mb-32 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary font-medium tracking-tight text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search your life</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            Built for <span className="text-primary/60 italic">heavy thinkers.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Founders, operators, and creators use Debo to bridge the gap between daily chaos and long-term clarity.
          </p>
        </div>

        <div className="space-y-24">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col gap-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">For {useCase.persona}</div>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              
              {/* User Question */}
              <div className="flex items-start gap-4 self-end flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="bg-background px-6 py-4 rounded-2xl rounded-tr-none border border-border shadow-sm">
                  <p className="text-base font-medium text-foreground italic leading-snug">
                    &ldquo;{useCase.question}&rdquo;
                  </p>
                </div>
              </div>

              {/* Debo Answer */}
              <div className="flex items-start gap-4 self-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-3 max-w-md">
                  <div className="bg-muted/30 p-6 rounded-2xl rounded-tl-none border border-border/50 backdrop-blur-sm">
                    <p className="text-base text-foreground font-medium leading-relaxed">
                      {useCase.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">Source:</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">{useCase.sources}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-40 text-center">
           <Link href="/join" className="minimal-btn-primary px-12 py-4 text-base">
              Start building your memory
           </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";



