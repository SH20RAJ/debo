"use client";

import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date("2026-09-17T00:00:00+05:30");

function getTimeLeft() {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <CountdownUnit value={time.days} label="Days" />
      <span className="text-lg font-extrabold text-primary/40 -mt-4">:</span>
      <CountdownUnit value={time.hours} label="Hrs" />
      <span className="text-lg font-extrabold text-primary/40 -mt-4">:</span>
      <CountdownUnit value={time.minutes} label="Min" />
      <span className="text-lg font-extrabold text-primary/40 -mt-4">:</span>
      <CountdownUnit value={time.seconds} label="Sec" />
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 text-lg font-extrabold tabular-nums text-primary">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
    </div>
  );
}
