"use client";

import { Sparkles, Brain, MessageCircle, Search, Check } from "lucide-react";

const features = [
  { icon: Brain, text: "Turns entries into durable memories" },
  { icon: MessageCircle, text: "Natural language conversations with your past" },
  { icon: Search, text: "Semantic search across everything" },
  { icon: Sparkles, text: "Pattern detection and insights" },
];

export function Solution() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl px-6 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">The Solution</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Meet your <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">second brain.</span>
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            Debo connects your thoughts, remembers everything you write, and lets you ask your past anything. 
            <span className="text-foreground font-medium"> Stop managing notes and start having conversations with your own mind.</span>
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 pt-8 max-w-2xl mx-auto">
            {features.map(({ icon: Icon, text }) => (
              <div 
                key={text}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 pt-12">
            {[
              { value: "100%", label: "Your data" },
              { value: "0", label: "Tags to manage" },
              { value: "∞", label: "Questions to ask" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-primary">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
