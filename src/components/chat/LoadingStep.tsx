"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface LoadingStepProps {
  icon: LucideIcon;
  label: string;
}

export function LoadingStep({ icon: Icon, label }: LoadingStepProps) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary shadow-sm">
      <span className="flex size-6 items-center justify-center rounded-md bg-background/70">
        <Icon className="size-3.5" />
      </span>
      <span className="truncate">{label}</span>
      <Loader2 className="ml-auto size-3.5 animate-spin" />
    </div>
  );
}
