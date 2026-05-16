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
    <section id="how-it-works" className="py-24 bg-background border-t-2 border-border/10">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center mb-20 space-y-5">
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1]">
            From raw moments to <span className="text-primary">usable memory.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground font-semibold leading-relaxed">
            Debo does the work between capture and recall: extracting structure, preserving evidence, and making your context searchable.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="w-14 h-14 rounded-2xl border-2 border-border bg-muted/30 text-primary flex items-center justify-center transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary/5">
                  <step.icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-foreground tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-8 rounded-2xl border-2 border-border bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-primary font-extrabold uppercase tracking-widest text-[10px]">Private Intelligence</span>
            </div>
            <h4 className="text-2xl font-bold text-foreground tracking-tight">Start with one note. Ask about it later.</h4>
          </div>
          <Link
            href="/#waitlist"
            className="minimal-btn-primary px-8 py-3 text-sm"
          >
            Join the waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
