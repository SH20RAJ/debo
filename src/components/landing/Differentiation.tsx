"use client";

import { Check, Minus, Brain, Shield, Zap, Sparkles, type LucideIcon } from "lucide-react";
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
    name: "Editable character profiles with source references",
    notes: false,
    chatbots: false,
    workspaces: false,
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
    <section id="comparison" className="py-28 bg-background border-t-2 border-border/10 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1]">
            Why Debo is <br />
            <span className="text-primary">memory-first.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground font-semibold leading-relaxed">
            Notes store content. Chatbots answer prompts. Debo is designed for long-term personal recall across people, sources, and time.
          </p>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_repeat(4,140px)] gap-3 items-end mb-10 px-4">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/30 pb-4">Capabilities</div>
              <ColumnHeader label="Notes" icon={Minus} />
              <ColumnHeader label="Chatbots" icon={Zap} />
              <ColumnHeader label="Workspaces" icon={Shield} />
              <ColumnHeader label="Debo" icon={Brain} isHighlight />
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="grid grid-cols-[1fr_repeat(4,140px)] gap-3 items-center p-5 rounded-2xl border-2 border-border/20 bg-card/30 transition-all hover:bg-card/50 hover:border-border/40 group"
                >
                  <div className="text-sm font-bold text-foreground/80 tracking-tight group-hover:text-foreground transition-colors">{feature.name}</div>
                  <div className="flex justify-center"><StatusIcon status={feature.notes} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.chatbots} /></div>
                  <div className="flex justify-center"><StatusIcon status={feature.workspaces} /></div>
                  <div className="flex justify-center bg-primary/[0.03] rounded-xl py-3 -my-3 border-x-2 border-primary/10">
                    <StatusIcon status={feature.debo} isHighlight />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
           <div className="flex items-center gap-5 px-6 py-4 rounded-2xl border-2 border-border/40 bg-muted/20 max-w-lg">
             <div className="w-10 h-10 rounded-xl border-2 border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
               <Sparkles className="w-5 h-5 text-primary" />
             </div>
             <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed italic tracking-wide">
                &ldquo;Conventional systems store data. LLMs store the world. <span className="text-foreground/70 font-bold not-italic">Debo stores your context.</span>&rdquo;
             </p>
           </div>
        </div>
      </div>
    </section>
  );
}

function ColumnHeader({ label, icon: Icon, isHighlight = false }: { label: string; icon: LucideIcon; isHighlight?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-3 pb-4 px-2 transition-all duration-200",
      isHighlight ? "text-primary scale-105" : "text-muted-foreground/20"
    )}>
      <div className={cn(
        "w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all",
        isHighlight ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/30"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[9px] font-extrabold uppercase tracking-widest">{label}</div>
    </div>
  );
}

function StatusIcon({ status, isHighlight = false }: { status: boolean | string, isHighlight?: boolean }) {
  if (status === "partial") {
    return (
      <div className="flex flex-col items-center opacity-20">
         <Minus className="w-4 h-4 text-muted-foreground" />
         <span className="text-[8px] font-extrabold uppercase tracking-tighter mt-1">Partial</span>
      </div>
    );
  }

  if (status) {
    return (
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
        isHighlight ? "bg-primary/20 text-primary scale-110" : "bg-muted-foreground/5 text-muted-foreground/20"
      )}>
        <Check className={cn("w-3.5 h-3.5", isHighlight ? "stroke-[3px]" : "stroke-[2px]")} />
      </div>
    );
  }

  return <div className="w-1.5 h-1.5 rounded-full bg-border/30" />;
}
