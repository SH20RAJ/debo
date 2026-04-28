"use client";

import { Loader2 } from "lucide-react";

interface LoadingStepProps {
  label: string;
}

export function LoadingStep({ label }: LoadingStepProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-medium animate-pulse">
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
