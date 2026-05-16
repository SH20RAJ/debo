import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function WaitlistPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-3xl border border-border/70 bg-card/80 p-4 shadow-2xl shadow-primary/5 dark:bg-card/70 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">Waitlist</div>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Reserve early access</h3>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/70">
          <ShieldCheck className="h-3.5 w-3.5" />
          Public preview {launchDateLabel}
        </div>
      </div>
 
    </div>
  );
}
