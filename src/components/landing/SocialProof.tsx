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
    <section id="social" className="py-24 bg-muted/20 border-t-2 border-border/40 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center mb-16 space-y-5">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-primary/20 bg-primary/5 text-primary font-extrabold uppercase tracking-widest text-[10px]">
             <Star className="w-3 h-3 fill-current opacity-60" />
             <span>Built in Public</span>
           </div>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1]">
              Built in public for <span className="text-primary">power users.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-base text-muted-foreground font-semibold leading-relaxed">
              Debo is evolving with people who already capture their life in notes, chats, calls, and voice memos.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="duo-card p-6 transition-all hover:border-primary/30 group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl border-2 border-primary/20 bg-primary/5 flex items-center justify-center font-bold text-primary text-sm">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-foreground tracking-tight text-sm">{t.author}</div>
                    <div className="text-[10px] font-extrabold text-muted-foreground/40 uppercase tracking-widest">{t.handle}</div>
                  </div>
                </div>
                <t.icon className="w-4 h-4 text-muted-foreground/15 group-hover:text-primary/40 transition-colors" />
              </div>
              <p className="text-base font-semibold text-foreground/80 leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-10 opacity-30 transition-all hover:opacity-60 duration-500">
           <div className="flex items-center gap-2 font-extrabold text-foreground uppercase tracking-widest text-[10px]">
             <Code className="w-4 h-4" />
             <span>Open Source</span>
           </div>

           <div className="flex items-center gap-2 font-extrabold text-foreground uppercase tracking-widest text-[10px]">
             <Globe className="w-4 h-4" />
              <span>Personal Context</span>
           </div>
           <div className="flex items-center gap-2 font-extrabold text-foreground uppercase tracking-widest text-[10px]">
             <Star className="w-4 h-4" />
             <span>500+ Stars</span>
           </div>
        </div>
      </div>
    </section>
  );
}
