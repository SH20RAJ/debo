"use client";

import { Mic, Brain, Sparkles, MessageSquare, ArrowRight, Network, Fingerprint } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "1. Capture",
    description: "Record voice notes, upload journals, or connect your calendar. Debo takes in your raw life context as it happens.",
    icon: Mic,
  },
  {
    title: "2. Extract",
    description: "Debo automatically extracts people, dates, promises, and decisions. It understands the 'who' and 'what' of your life.",
    icon: Fingerprint,
  },
  {
    title: "3. Remember",
    description: "Every detail is woven into your private memory graph. No data is ever lost or forgotten by the system.",
    icon: Network,
  },
  {
    title: "4. Ask or Act",
    description: "Ask questions and get answers grounded in your past, with cited sources. Draft emails or events based on what you remember.",
    icon: Sparkles,
  },
];

export function Solution() {
  return (
    <section id="how-it-works" className="py-32 bg-background border-t border-border/10">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            How your <span className="text-primary/80">memory engine</span> works.
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            A private, automated loop that ensures your experiences become permanent, searchable knowledge.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="w-14 h-14 rounded-xl bg-background border border-border text-primary/60 flex items-center justify-center transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-sm">
                  <step.icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-semibold text-foreground tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 p-10 rounded-2xl bg-muted/30 border border-border flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Brain className="w-4 h-4 text-primary/60" />
              <span className="text-primary/60 font-semibold uppercase tracking-widest text-[9px]">Private Intelligence</span>
            </div>
            <h4 className="text-2xl font-semibold text-foreground tracking-tight">Ready to record your first memory?</h4>
          </div>
          <Link
            href="/join"
            className="minimal-btn-primary px-10 py-3 text-base"
          >
            Start Remembering
          </Link>
        </div>
      </div>
    </section>
  );
}





