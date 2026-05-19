"use client";

import { cn, formatDuration } from "@/lib/utils";
import { Play, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VoiceNote {
  id: string;
  title: string;
  duration: number;
  date: string;
  transcriptionStatus: "completed" | "processing" | "pending";
  waveform: number[];
}

const statusConfig = {
  completed: { label: "Transcribed", variant: "default" as const, icon: CheckCircle2 },
  processing: { label: "Processing", variant: "outline" as const, icon: Loader2 },
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
};

export function VoiceCard({ note }: { note: VoiceNote }) {
  const status = statusConfig[note.transcriptionStatus];
  const StatusIcon = status.icon;

  return (
    <Card className="transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardContent className="py-5">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="rounded-full shrink-0"
          >
            <Play className="w-4 h-4 ml-0.5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">{note.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(note.duration)}
              </span>
              <span className="text-xs text-muted-foreground">{note.date}</span>
            </div>
          </div>

          <Badge variant={status.variant} className="gap-1">
            <StatusIcon className={cn("w-3 h-3", note.transcriptionStatus === "processing" && "animate-spin")} />
            {status.label}
          </Badge>
        </div>

        {/* Waveform visualization */}
        <div className="flex items-end gap-[2px] h-8 mt-4">
          {note.waveform.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-primary/20 transition-all"
              style={{ height: `${Math.max(h * 100, 10)}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
