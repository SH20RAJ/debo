"use client";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoryReceiptProps {
  title: string;
  detected: { type: string; value: string }[];
  sourceType: string;
  onClose: () => void;
}

export function MemoryReceipt({ title, detected, sourceType, onClose }: MemoryReceiptProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-lg max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground capitalize">{sourceType} saved to memory</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      {detected.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Detected</p>
          <div className="flex flex-wrap gap-1.5">
            {detected.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                <span className="capitalize">{d.type}:</span> {d.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
