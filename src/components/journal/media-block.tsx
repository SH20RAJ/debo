"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, X, Play, Mic2, Video, FileImage, ExternalLink, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaKind = "audio" | "video" | "image";

interface MediaBlockProps {
  kind: MediaKind;
  label: string;
  size: string;
  src: string;
  transcription?: string;
  onRemove?: () => void;
  onUpdate?: (updates: { label?: string; transcription?: string }) => void;
}

export function MediaBlock({ kind, label, size, src, transcription, onRemove, onUpdate }: MediaBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(label);

  const handleSaveLabel = () => {
    setIsEditingLabel(false);
    if (editedLabel !== label && onUpdate) {
      onUpdate({ label: editedLabel });
    }
  };

  const Icon = kind === "video" ? Video : kind === "audio" ? Mic2 : FileImage;

  return (
    <div className="not-prose my-4 rounded-xl border-2 border-duo-swan/40 bg-duo-polar/20 overflow-hidden">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between p-3 border-b border-duo-swan/20">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-duo-green/10 text-duo-green border border-duo-green/20">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {isEditingLabel ? (
              <input
                type="text"
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                onBlur={handleSaveLabel}
                onKeyDown={(e) => e.key === "Enter" && handleSaveLabel()}
                className="text-sm font-black text-duo-eel bg-transparent border-b border-duo-green/50 outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingLabel(true)}
                className="text-sm font-black text-duo-eel hover:text-duo-green transition-colors"
              >
                {label}
              </button>
            )}
            <p className="text-xs font-bold text-duo-wolf/60">{size}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-duo-swan/30 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-duo-wolf transition hover:bg-duo-swan/20 hover:text-duo-eel"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
          {transcription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border border-duo-swan/30 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition",
                isExpanded ? "bg-duo-green/10 border-duo-green/30 text-duo-green" : "text-duo-wolf hover:bg-duo-swan/20 hover:text-duo-eel"
              )}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Subtitles
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-duo-swan/30 text-duo-wolf/50 hover:border-red-500/50 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Media Player */}
      <div className="bg-black">
        {kind === "video" ? (
          <video
            src={src}
            controls
            playsInline
            preload="metadata"
            className="w-full aspect-video"
          />
        ) : kind === "audio" ? (
          <div className="p-4">
            <audio src={src} controls preload="metadata" className="w-full" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="max-h-[400px] w-full object-contain" />
        )}
      </div>

      {/* Transcripts Section */}
      {transcription && (
        <div className={cn("transition-all", isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden")}>
          <div className="p-4 bg-duo-snow/50 border-t border-duo-swan/20">
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-duo-green mb-2">
              Transcript / Subtitles
            </h4>
            <div className="text-sm font-bold text-duo-wolf leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {transcription}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Regex patterns to extract media from various formats
export function extractMediaFromContent(content: string): Array<{
  match: RegExpMatchArray;
  kind: MediaKind;
  label: string;
  size: string;
  src: string;
  fullLine: string;
}> {
  const patterns = [
    // Pattern: "- video: filename (size) r2://path"
    /^-\s*(audio|video|image):\s*(.+?)\s+\(([^)]+)\)\s+(r2:\/\/\S+|https?:\/\/\S+)/i,
    // Pattern: "video: filename (size) r2://path"
    /^([^*\s-]*(?:audio|video|image)(?::\s*|\s+))?([^*\s]+?):\s*(.+?)\s+\(([^)]+)\)\s+(r2:\/\/\S+|https?:\/\/\S+)/i,
    // Pattern: "Attached video: https://..."
    /Attached\s+(audio|video):\s+(r2:\/\/\S+|https?:\/\/\S+)/i,
  ];

  const results: Array<{
    match: RegExpMatchArray;
    kind: MediaKind;
    label: string;
    size: string;
    src: string;
    fullLine: string;
  }> = [];

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Pattern 1: "- video: filename (size) r2://path"
    const match1 = /^-\s*(audio|video|image):\s*(.+?)\s+\(([^)]+)\)\s+(r2:\/\/\S+|https?:\/\/\S+)/i.exec(trimmed);
    if (match1) {
      results.push({
        match: match1,
        kind: match1[1].toLowerCase() as MediaKind,
        label: match1[2].trim(),
        size: match1[3].trim(),
        src: match1[4].trim(),
        fullLine: line,
      });
      continue;
    }

    // Pattern 2: Check if line contains "video:" or "audio:" with r2://
    const mediaMatch = /(?:^|\s)(audio|video|image):\s*([^\n]+?)\s+\(([^)]+)\)\s+(r2:\/\/\S+|https?:\/\/\S+)/i.exec(trimmed);
    if (mediaMatch) {
      results.push({
        match: mediaMatch,
        kind: mediaMatch[1].toLowerCase() as MediaKind,
        label: mediaMatch[2].trim(),
        size: mediaMatch[3].trim(),
        src: mediaMatch[4].trim(),
        fullLine: line,
      });
      continue;
    }

    // Pattern 3: "Attached video: r2://..."
    const attachedMatch = /Attached\s+(audio|video):\s+(r2:\/\/\S+|https?:\/\/\S+)/i.exec(trimmed);
    if (attachedMatch) {
      const kind = attachedMatch[1].toLowerCase() as MediaKind;
      const src = attachedMatch[2];
      results.push({
        match: attachedMatch,
        kind,
        label: `${kind} recording`,
        size: "Unknown size",
        src,
        fullLine: line,
      });
    }
  }

  return results;
}

export function mediaSrcFromR2(r2Path: string): string {
  if (r2Path.startsWith("r2://")) {
    const key = r2Path.slice("r2://".length);
    return `/api/capture/media/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
  return r2Path;
}