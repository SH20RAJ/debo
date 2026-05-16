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

      <iframe
        src="https://tally.so/embed/Gxq11k?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        width="100%"
        height="520"
        title="Debo waitlist"
        className="rounded-2xl bg-background"
      />

      <div className="mt-4 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Having trouble with the embed?</span>
        <Link
          href={waitlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80"
        >
          Open waitlist
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
