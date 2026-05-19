"use client";

import { cn, formatDuration } from "@/lib/utils";
import { Play, Clock, CheckCircle2, Loader2 } from "lucide-react";

export interface VoiceNote {
  id: string;
  title: string;
  duration: number; // in seconds
  date: string;
  transcriptionStatus: "completed" | "processing" | "pending";
  waveform: number[]; // array of bar heights (0-1)
}

const statusConfig = {
  completed: { label: "Transcribed", className: "bg-primary/10 text-primary", icon: CheckCircle2 },
  processing: { label: "Processing", className: "bg-blue-500/10 text-blue-500", icon: Loader2 },
  pending: { label: "Pending", className: "bg-muted text-muted-foreground", icon: Clock },
};

export function VoiceCard({ note }: { note: VoiceNote }) {
  const status = statusConfig[note.transcriptionStatus];
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors">
          <Play className="w-4 h-4 ml-0.5" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{note.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(note.duration)}
            </span>
            <span className="text-xs text-muted-foreground">{note.date}</span>
          </div>
        </div>

        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1", status.className)}>
          <StatusIcon className={cn("w-3 h-3", note.transcriptionStatus === "processing" && "animate-spin")} />
          {status.label}
        </span>
      </div>

      {/* Waveform visualization placeholder */}
      <div className="flex items-end gap-[2px] h-8 mt-4">
        {note.waveform.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-primary/20 transition-all"
            style={{ height: `${Math.max(h * 100, 10)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
