"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { VoiceCard, type VoiceNote } from "./voice-card";
import { cn } from "@/lib/utils";

const mockNotes: VoiceNote[] = [
  {
    id: "1",
    title: "Marketing Sync Follow-up",
    duration: 72,
    date: "Today, 2:30 PM",
    transcriptionStatus: "completed",
    waveform: [0.3, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.7, 0.5, 0.6, 0.3],
  },
  {
    id: "2",
    title: "Product Ideas - Voice Dump",
    duration: 145,
    date: "Today, 11:15 AM",
    transcriptionStatus: "completed",
    waveform: [0.2, 0.4, 0.6, 0.3, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.4, 0.9, 0.6, 0.3, 0.5],
  },
  {
    id: "3",
    title: "Call with Investor - Quick Notes",
    duration: 210,
    date: "Yesterday, 4:00 PM",
    transcriptionStatus: "completed",
    waveform: [0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.4, 0.9, 0.6, 0.3, 0.5, 0.8, 0.4, 0.7, 0.6, 0.3, 0.5, 0.9, 0.4, 0.7, 0.6, 0.3, 0.8, 0.5, 0.4, 0.7, 0.6, 0.3, 0.5, 0.8],
  },
  {
    id: "4",
    title: "Morning Reflection",
    duration: 48,
    date: "Yesterday, 8:30 AM",
    transcriptionStatus: "processing",
    waveform: [0.5, 0.3, 0.7, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.4, 0.6, 0.3, 0.8, 0.5, 0.4, 0.7, 0.6, 0.3, 0.5, 0.8, 0.4, 0.7, 0.3, 0.6, 0.5, 0.8, 0.4, 0.3, 0.7, 0.5],
  },
  {
    id: "5",
    title: "Feature Brainstorm - Debo Voice",
    duration: 95,
    date: "May 17",
    transcriptionStatus: "completed",
    waveform: [0.6, 0.4, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.4, 0.6, 0.9, 0.3, 0.5, 0.8, 0.4, 0.7, 0.6, 0.3, 0.5, 0.8, 0.4, 0.7, 0.6, 0.3, 0.9],
  },
];

const tabs = ["Voice Notes", "AI Calls", "Transcripts"] as const;

export function VoicePage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Voice Notes");
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Voice</h1>

      {/* Record button */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isRecording
              ? "bg-destructive text-destructive-foreground shadow-destructive/30 scale-110"
              : "bg-primary text-primary-foreground shadow-primary/30 hover:scale-105"
          )}
        >
          <Mic className="w-8 h-8" />
        </button>
        <p className="text-sm text-muted-foreground mt-3">
          {isRecording ? "Recording... Tap to stop" : "Tap to record a voice note"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Recordings list */}
      <div className="space-y-3">
        {activeTab === "Voice Notes" &&
          mockNotes.map((note) => <VoiceCard key={note.id} note={note} />)}

        {activeTab === "AI Calls" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No AI calls yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a call to debrief your day or plan with Debo.
            </p>
          </div>
        )}

        {activeTab === "Transcripts" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Transcripts will appear here.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed transcriptions from your voice notes and calls.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
