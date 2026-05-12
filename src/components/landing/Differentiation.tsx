"use client";

import { Check, Minus, Brain, Search, Shield, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Store notes & journals",
    notes: true,
    chatbots: false,
    workspaces: true,
    debo: true,
  },
  {
    name: "Search by meaning (Semantic)",
    notes: false,
    chatbots: true,
    workspaces: false,
    debo: true,
  },
  {
    name: "Connect people, events & tasks",
    notes: false,
    chatbots: false,
    workspaces: "partial",
    debo: true,
  },
  {
    name: "Answers with cited sources",
    notes: false,
    chatbots: false,
    workspaces: false,
    debo: true,
  },
  {
    name: "Turn memories into approved actions",
    notes: false,
    chatbots: false,
    workspaces: "partial",
    debo: true,
  },
  {
    name: "Built for personal long-term memory",
    notes: true,
    chatbots: false,
    workspaces: false,
    debo: true,
  },
];

export function Differentiation() {
  return (
    <section id="comparison" className="py-32 bg-background border-t border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground tracking-tight leading-[1.1]">
            How Debo <span className="text-primary/60 italic">compares.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            Personal memory is different from general knowledge. Debo is built specifically to connect your life context over decades.
          </p>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_repeat(4,160px)] gap-4 items-end mb-10 px-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 pb-4">Capability</div>
              <ColumnHeader label="Notes Apps" icon={Minus} />
              <ColumnHeader label="Chatbots" icon={Zap} />
              <ColumnHeader label="Workspaces" icon={Shield} />
              <ColumnHeader label="Debo" icon={Brain} isHighlight />
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {features.map((feature, i) => (
                <div 
                  key={feature.name} 
                  className="grid grid-cols-[1fr_repeat(4,160px)] gap-4 items-center p-5 rounded-xl border border-border/40 bg-card/30 transition-all hover:border-primary/20 hover:bg-card/50"
                >
                  <div className="text-base font-semibold text-foreground tracking-tight">{feature.name}</div>
                  <div className="flex justify-center"><StatusIcon status={feature.notes} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.chatbots} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.workspaces} /></div>
                  <div className="flex justify-center bg-primary/5 rounded-lg py-3 -my-3 border-x border-primary/10">
                    <StatusIcon status={feature.debo} isHighlight />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
           <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-muted/30 border border-border max-w-md backdrop-blur-sm">
             <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
               <Sparkles className="w-5 h-5 text-primary" />
             </div>
             <p className="text-xs font-medium text-muted-foreground leading-relaxed">
               "Notes apps store data. Chatbots know the world. <span className="text-foreground font-semibold">Debo knows you.</span>"
             </p>
           </div>
        </div>
      </div>
    </section>
  );
}

function ColumnHeader({ label, icon: Icon, isHighlight = false }: { label: string, icon: any, isHighlight?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-4 pb-4 px-2 transition-all duration-300",
      isHighlight ? "text-primary scale-105" : "text-muted-foreground/40"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl border flex items-center justify-center",
        isHighlight ? "bg-primary/10 border-primary/40 shadow-sm" : "bg-muted/30 border-border"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}

function StatusIcon({ status, isHighlight = false }: { status: boolean | string, isHighlight?: boolean }) {
  if (status === "partial") {
    return (
      <div className="flex flex-col items-center">
         <Minus className="w-4 h-4 text-muted-foreground/40" />
         <span className="text-[8px] font-semibold uppercase tracking-tighter text-muted-foreground/30 mt-1">Partial</span>
      </div>
    );
  }
  
  if (status) {
    return (
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center transition-all",
        isHighlight ? "bg-primary text-primary-foreground scale-110 shadow-sm" : "bg-muted-foreground/10 text-muted-foreground"
      )}>
        <Check className="w-3.5 h-3.5" />
      </div>
    );
  }
  
  return <div className="w-1.5 h-1.5 rounded-full bg-border/40" />;
}

