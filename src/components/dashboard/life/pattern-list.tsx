"use client";

import { BrainCircuit } from "lucide-react";
import type { Pattern } from "@/types/insights";

export function PatternList({ patterns }: { patterns: Pattern[] }) {
  const maxCount = Math.max(...patterns.map(p => p.count), 1);

  return (
    <div className="duo-card overflow-hidden p-0">
      <div className="p-6 border-b-2 border-duo-swan bg-duo-polar">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-duo-macaw" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-duo-swan">
            Mention Counts
          </div>
        </div>
      </div>
      <div className="divide-y-2 divide-duo-swan">
        {patterns.length > 0 ? (
          patterns.map((p) => (
            <div key={p.entity} className="flex items-center justify-between p-6 hover:bg-duo-polar/50 transition-colors">
              <span className="font-black text-duo-eel">{p.entity}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-duo-wolf uppercase tracking-wider">{p.count}x</span>
                <div className="h-4 w-24 rounded-full bg-duo-swan">
                  <div 
                    className="h-full rounded-full bg-duo-macaw shadow-[0_2px_0_var(--duo-macaw-shadow)]" 
                    style={{ width: `${Math.min(100, (p.count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-duo-swan font-bold">
            No patterns found yet. Keep writing!
          </div>
        )}
      </div>
    </div>
  );
}
