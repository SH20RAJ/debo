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
    <section id="how-it-works" className="py-24 bg-background border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel leading-tight">
            How your <span className="text-duo-macaw">memory engine</span> works.
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-duo-wolf font-bold leading-relaxed">
            A private, automated loop that ensures your experiences become permanent, searchable knowledge.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="w-20 h-20 rounded-[2rem] bg-background border-2 border-duo-swan text-duo-macaw flex items-center justify-center shadow-[0_4px_0_var(--duo-swan)] group-hover:scale-105 transition-transform">
                  <step.icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-black text-duo-eel uppercase tracking-wider">{step.title}</h3>
                <p className="text-base text-duo-wolf font-bold leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-[3rem] bg-duo-polar border-4 border-duo-swan shadow-[0_12px_0_var(--duo-swan)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Brain className="w-5 h-5 text-duo-macaw" />
              <span className="text-duo-macaw font-black uppercase tracking-widest text-[10px]">Private Intelligence</span>
            </div>
            <h4 className="text-3xl font-black text-duo-eel leading-tight">Ready to record your first memory?</h4>
          </div>
          <Link
            href="/join"
            className="duo-btn duo-btn--primary px-12 py-5 text-xl shadow-[0_6px_0_var(--duo-feather-shadow)]"
          >
            Start Remembering
          </Link>
        </div>
      </div>
    </section>
  );
}





