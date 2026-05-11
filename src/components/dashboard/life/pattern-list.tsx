"use client";

import { BrainCircuit } from "lucide-react";
import type { Pattern } from "@/types/insights";

export function PatternList({ patterns }: { patterns: Pattern[] }) {
  const maxCount = Math.max(...patterns.map(p => p.count), 1);

  return (
    <div className="duo-card overflow-hidden p-0 border-b-4">
      <div className="p-7 border-b-2 border-duo-swan bg-duo-snow">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-macaw/10 border-2 border-duo-macaw/20">
            <BrainCircuit className="h-6 w-6 text-duo-macaw" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-duo-wolf/60">
              Mention Intensity
            </div>
            <div className="text-sm font-bold text-duo-eel">
              Entities found in your stream
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y-2 divide-duo-swan bg-white">
        {patterns.length > 0 ? (
          patterns.map((p) => (
            <div key={p.entity} className="flex items-center justify-between p-7 hover:bg-duo-polar/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-duo-macaw group-hover:scale-150 transition-transform" />
                <span className="text-lg font-black text-duo-eel tracking-tight">{p.entity}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-black text-duo-wolf uppercase tracking-widest">{p.count} mentions</span>
                <div className="h-5 w-32 rounded-full bg-duo-swan/50 p-1">
                  <div 
                    className="h-full rounded-full bg-duo-macaw shadow-[0_2px_0_rgba(28,176,246,0.5)] transition-all duration-1000" 
                    style={{ width: `${Math.max(8, (p.count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center">
            <div className="text-lg font-bold text-duo-swan">
              The graph is currently silent.
            </div>
            <p className="mt-2 text-sm text-duo-wolf font-bold">
              Capture more thoughts to reveal cognitive patterns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
