"use client";

import Link from "next/link";
import { Sparkles, User, Search, BarChart3, ClipboardList, Lightbulb } from "lucide-react";

const useCases = [
  {
    persona: "Founders",
    question: "Why did we pause the React migration in June?",
    answer: "Your June 12 voice note says the team chose the mobile performance audit first because senior frontend capacity was limited.",
    icon: Lightbulb,
    sources: "Voice note • June 12",
  },
  {
    persona: "Operators",
    question: "What do I owe Sarah this week?",
    answer: "You promised Sarah the Q4 hiring plan by Friday and still need Raj's budget numbers before Tuesday.",
    icon: ClipboardList,
    sources: "Journal • Tuesday",
  },
  {
    persona: "Researchers",
    question: "What patterns are emerging in my user interviews?",
    answer: "Across 12 sessions, users repeatedly mention weak export tools and a need for AI answers that cite exact source moments.",
    icon: BarChart3,
    sources: "12 Voice Notes",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="text-center mb-32 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary font-medium tracking-tight text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search your life</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            Built for people who <span className="text-primary/60 italic">live in context.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Use Debo when the detail matters later: decisions, people, commitments, research patterns, and personal history.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary/70">
                  <useCase.icon className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">For {useCase.persona}</div>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-background px-4 py-3 rounded-2xl rounded-tr-none border border-border shadow-sm">
                  <p className="text-sm font-semibold text-foreground italic leading-snug">
                    &ldquo;{useCase.question}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 self-start">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <div className="bg-muted/30 p-4 rounded-2xl rounded-tl-none border border-border/50 backdrop-blur-sm">
                    <p className="text-sm text-foreground font-medium leading-relaxed">
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

        <div className="mt-24 text-center">
           <Link href="/#waitlist" className="minimal-btn-primary px-12 py-4 text-base">
              Join the waitlist
           </Link>
        </div>
      </div>
    </section>
  );
}

