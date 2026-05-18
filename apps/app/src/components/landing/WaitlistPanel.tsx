import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { launchDateLabel, waitlistUrl } from "@/lib/launch";

export function WaitlistPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`duo-card p-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Waitlist</div>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">Reserve early access</h3>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Public preview {launchDateLabel}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={waitlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="minimal-btn-primary px-6 py-2.5 text-sm flex-1"
        >
          Join the waitlist
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
