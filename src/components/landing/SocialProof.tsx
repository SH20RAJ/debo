"use client";

import { MessageSquare, Code, Globe, Star } from "lucide-react";

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
    <section id="social" className="py-32 bg-muted/20 border-t border-border/40 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold uppercase tracking-widest text-[9px]">
             <Star className="w-3 h-3 fill-current opacity-60" />
             <span>Built in Public</span>
           </div>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
              Built in public for <span className="text-primary/60 italic">power users.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
              Debo is evolving with people who already capture their life in notes, chats, calls, and voice memos.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="minimal-card p-8 bg-card/60 backdrop-blur-md border border-border/50 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center font-bold text-primary/40 text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground tracking-tight text-sm">{t.author}</div>
                    <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{t.handle}</div>
                  </div>
                </div>
                <t.icon className="w-4 h-4 text-muted-foreground/10 group-hover:text-primary/40 transition-colors" />
              </div>
              <p className="text-base font-medium text-foreground/80 leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 flex flex-wrap justify-center gap-12 grayscale opacity-20 contrast-125 transition-all hover:opacity-100 hover:grayscale-0 duration-700">
           <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-[0.2em] text-[9px]">
             <Code className="w-4 h-4" />
             <span>Open Source</span>
           </div>

           <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-[0.2em] text-[9px]">
             <Globe className="w-4 h-4" />
              <span>Personal Context</span>
           </div>
           <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-[0.2em] text-[9px]">
             <Star className="w-4 h-4" />
             <span>500+ Stars</span>
           </div>
        </div>
      </div>
    </section>
  );
}
