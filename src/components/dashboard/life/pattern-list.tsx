"use client";

import { BrainCircuit } from "lucide-react";
import type { Pattern } from "@/types/insights";

export function PatternList({ patterns }: { patterns: Pattern[] }) {
  const maxCount = Math.max(...patterns.map(p => p.count), 1);

  return (
    <div className="minimal-card bg-card/40 border border-border/50 overflow-hidden p-0">
      <div className="p-8 border-b border-border/50 bg-muted/5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
            <BrainCircuit className="h-6 w-6 text-primary/60" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
              Repeated Signals
            </div>
            <div className="text-sm font-semibold text-foreground tracking-tight">
              People, topics, and feelings that appear often
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/30 bg-card/10">
        {patterns.length > 0 ? (
          patterns.map((p) => (
            <div key={p.entity} className="flex items-center justify-between p-8 hover:bg-primary/[0.02] transition-all group">
              <div className="flex items-center gap-5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-125 transition-all" />
                <span className="text-lg font-medium text-foreground tracking-tight">{p.entity}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{p.count} signals</span>
                <div className="h-2.5 w-32 rounded-full bg-muted/20 p-0.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary/40 transition-all duration-1000 group-hover:bg-primary/60 shadow-lg shadow-primary/5" 
                    style={{ width: `${Math.max(8, (p.count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center">
            <div className="text-xl font-heading font-semibold text-foreground/40 tracking-tight">
              No patterns yet
            </div>
            <p className="mt-3 text-sm text-muted-foreground/20 font-medium italic">
              Add more journals and Debo will connect the dots here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
