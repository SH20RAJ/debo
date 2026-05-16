"use client";

import { useEffect, useMemo, useState } from "react";

import { launchDateIso } from "@/lib/launch";

type TimeUnit = {
  label: string;
  value: string;
};

function getRemaining(): TimeUnit[] {
  const launchTime = new Date(launchDateIso).getTime();
  const diff = Math.max(0, launchTime - Date.now());
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    { label: "Days", value: String(days) },
    { label: "Hours", value: String(hours).padStart(2, "0") },
    { label: "Minutes", value: String(minutes).padStart(2, "0") },
    { label: "Seconds", value: String(secs).padStart(2, "0") },
  ];
}

export function LaunchCountdown({ compact = false }: { compact?: boolean }) {
  const [units, setUnits] = useState<TimeUnit[]>(() => getRemaining());
  const isLaunched = useMemo(() => units.every((unit) => Number(unit.value) === 0), [units]);

  useEffect(() => {
    const timer = window.setInterval(() => setUnits(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (isLaunched) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-semibold text-primary">
        Public preview is opening now.
      </div>
    );
  }

  return (
    <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-4"}>
      {units.map((unit) => (
        <div
          key={unit.label}
          className="rounded-2xl border border-border/60 bg-background/70 p-4 text-center shadow-sm dark:bg-card/60"
        >
          <div className={compact ? "text-2xl font-semibold text-foreground" : "text-3xl font-semibold text-foreground md:text-4xl"}>
            {unit.value}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/60">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
