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
    <section id="comparison" className="py-40 bg-background border-t border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-32 space-y-8">
          <h2 className="text-5xl md:text-6xl font-heading font-semibold text-foreground tracking-tighter leading-[0.95]">
            Architectural <br />
            <span className="text-primary/20 italic">Differentiation.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground/60 font-medium leading-relaxed tracking-tight">
            Personal memory retrieval requires a distinct architecture. Debo is optimized for long-term semantic persistence.
          </p>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_repeat(4,160px)] gap-4 items-end mb-12 px-6">
              <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/10 pb-4">Capabilities Node</div>
              <ColumnHeader label="Notes" icon={Minus} />
              <ColumnHeader label="Chatbots" icon={Zap} />
              <ColumnHeader label="Workspaces" icon={Shield} />
              <ColumnHeader label="Debo" icon={Brain} isHighlight />
            </div>

            {/* Rows */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div 
                  key={feature.name} 
                  className="grid grid-cols-[1fr_repeat(4,160px)] gap-4 items-center p-6 rounded-2xl border border-border/20 bg-card/10 transition-all hover:bg-card/20 hover:border-border/40 group"
                >
                  <div className="text-base font-semibold text-foreground/80 tracking-tight group-hover:text-foreground transition-colors">{feature.name}</div>
                  <div className="flex justify-center"><StatusIcon status={feature.notes} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.chatbots} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.workspaces} /></div>
                  <div className="flex justify-center bg-primary/[0.02] rounded-xl py-4 -my-4 border-x border-primary/5">
                    <StatusIcon status={feature.debo} isHighlight />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-10 text-center md:text-left">
           <div className="flex items-center gap-6 px-8 py-5 rounded-2xl bg-muted/5 border border-border/40 max-w-lg backdrop-blur-3xl">
             <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
               <Sparkles className="w-5 h-5 text-primary/40" />
             </div>
             <p className="text-[11px] font-medium text-muted-foreground/40 leading-relaxed italic tracking-wide">
               "Conventional systems store data. LLMs store the world. <span className="text-foreground/60 font-bold not-italic">Debo stores your context.</span>"
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
      isHighlight ? "text-primary/60 scale-105" : "text-muted-foreground/10"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all",
        isHighlight ? "bg-primary/5 border-primary/20 shadow-xl shadow-primary/5" : "bg-muted/10 border-border/20"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-[9px] font-bold uppercase tracking-[0.3em]">{label}</div>
    </div>
  );
}

function StatusIcon({ status, isHighlight = false }: { status: boolean | string, isHighlight?: boolean }) {
  if (status === "partial") {
    return (
      <div className="flex flex-col items-center opacity-20">
         <Minus className="w-4 h-4 text-muted-foreground" />
         <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Incomplete</span>
      </div>
    );
  }
  
  if (status) {
    return (
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
        isHighlight ? "bg-primary/20 text-primary scale-110 shadow-lg shadow-primary/10" : "bg-muted-foreground/5 text-muted-foreground/20"
      )}>
        <Check className={cn("w-3.5 h-3.5", isHighlight ? "stroke-[3px]" : "stroke-[2px]")} />
      </div>
    );
  }
  
  return <div className="w-1 h-1 rounded-full bg-border/20" />;
}

