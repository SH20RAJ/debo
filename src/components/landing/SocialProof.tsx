"use client";

import { MessageSquare, Code, Globe, Star, Quote } from "lucide-react";
import Link from "next/link";

const testimonials = [
  {
    author: "Shaswat Raj",
    handle: "@sh20raj",
    text: "Building the memory engine I always wanted. Open source, private, and actually useful for people who think in voice notes.",
    platform: "Community",
    icon: MessageSquare,
  },
  {
    author: "Early Adopter",
    handle: "@operator_x",
    text: "The extraction logic is frighteningly good. It caught a follow-up I promised in a 5-minute walk-and-talk voice note.",
    platform: "Open Source",
    icon: Code,
  },
];


export function SocialProof() {
  return (
    <section id="social" className="py-24 bg-duo-polar border-t-2 border-duo-swan relative overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw font-black uppercase tracking-widest text-[10px]">
             <Star className="w-3 h-3 fill-current" />
             <span>Built in Public</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel leading-tight">
             Join the <span className="text-duo-macaw">builders.</span>
           </h2>
           <p className="max-w-2xl mx-auto text-xl text-duo-wolf font-bold leading-relaxed">
             Debo is being built openly with feedback from founders and operators.
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="duo-card p-8 bg-background shadow-[0_8px_0_var(--duo-swan)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-duo-macaw/10 border-2 border-duo-macaw flex items-center justify-center font-black text-duo-macaw">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-black text-duo-eel uppercase tracking-tight text-sm">{t.author}</div>
                    <div className="text-xs font-bold text-duo-wolf">{t.handle}</div>
                  </div>
                </div>
                <t.icon className="w-5 h-5 text-duo-swan" />
              </div>
              <p className="text-lg font-bold text-duo-eel leading-relaxed italic">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-12 grayscale opacity-50 contrast-125">
           <div className="flex items-center gap-2 font-black text-duo-eel uppercase tracking-widest text-sm">
             <Code className="w-5 h-5" />
             <span>Open Source</span>
           </div>

           <div className="flex items-center gap-2 font-black text-duo-eel uppercase tracking-widest text-sm">
             <Globe className="w-5 h-5" />
             <span>Global Context</span>
           </div>
           <div className="flex items-center gap-2 font-black text-duo-eel uppercase tracking-widest text-sm">
             <Star className="w-5 h-5" />
             <span>500+ Stars</span>
           </div>
        </div>
      </div>
    </section>
  );
}
