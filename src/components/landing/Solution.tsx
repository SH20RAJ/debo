"use client";

import { Mic, Brain, Sparkles, Network, Fingerprint } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "1. Capture",
    description: "Write, talk, chat, or connect context. Debo keeps the input simple so the habit stays lightweight.",
    icon: Mic,
  },
  {
    title: "2. Extract",
    description: "People, dates, promises, decisions, and topics are pulled out automatically with source references attached.",
    icon: Fingerprint,
  },
  {
    title: "3. Remember",
    description: "Details are connected in a private memory graph, so related moments stay linked across time and format.",
    icon: Network,
  },
  {
    title: "4. Ask or Act",
    description: "Ask grounded questions, recover the evidence, then draft reminders, events, or replies only when you approve.",
    icon: Sparkles,
  },
];

export function Solution() {
  return (
    <section id="how-it-works" className="py-32 bg-background border-t border-border/10">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            From raw moments to <span className="text-primary/80">usable memory.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            Debo does the work between capture and recall: extracting structure, preserving evidence, and making your context searchable.
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
            <h4 className="text-2xl font-semibold text-foreground tracking-tight">Start with one note. Ask about it later.</h4>
          </div>
          <Link
            href="/#waitlist"
            className="minimal-btn-primary px-10 py-3 text-base"
          >
            Join the waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}



