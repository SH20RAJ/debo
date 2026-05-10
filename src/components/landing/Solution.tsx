"use client";

import { Mic, Brain, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "1. Capture",
    description: "Record voice, upload journal pages, import AI chats, or connect your calendar. Debo takes it all in.",
    icon: Mic,
  },
  {
    title: "2. Understand",
    description: "Debo automatically extracts people, dates, tasks, emotions, and recurring patterns from your context.",
    icon: Brain,
  },
  {
    title: "3. Ask or Act",
    description: "Search your past, discover hidden insights, or let Debo draft your reminders and calendar events.",
    icon: MessageSquare,
  },
];

export function Solution() {
  return (
    <section id="features" className="py-24 bg-background border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel">
            Debo turns raw life <span className="text-duo-macaw">context into memory.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-duo-wolf font-bold leading-relaxed">
            A seamless bridge between your daily experiences and a searchable, intelligent record of your life.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-6 text-duo-swan">
                  <ArrowRight className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="w-24 h-24 rounded-[2.5rem] bg-background border-2 border-duo-swan text-duo-macaw flex items-center justify-center shadow-[0_4px_0_var(--duo-swan)]">
                  <step.icon className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-black text-duo-eel uppercase tracking-wider">{step.title}</h3>
                <p className="text-lg text-duo-wolf font-bold leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-[3rem]   border-b-[8px] border-black flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="w-5 h-5  " />
              <span className="    uppercase tracking-widest text-xs">Intelligence Layer</span>
            </div>
            <h4 className="text-3xl     leading-tight">Ready to start remembering?</h4>
          </div>
          <Link
            href="/join"
            className="duo-btn duo-btn--primary px-12 py-5 text-xl shadow-[0_6px_0_var(--duo-feather-shadow)]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>

  );
}




