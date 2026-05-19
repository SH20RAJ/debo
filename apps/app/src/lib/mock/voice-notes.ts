export interface VoiceNote {
  id: string;
  title: string;
  duration: number;
  date: string;
  transcriptionStatus: "completed" | "processing" | "pending";
  waveform: number[];
}

export const VOICE_NOTES: VoiceNote[] = [
  {
    id: "vn-001",
    title: "Marketing Sync Follow-up",
    duration: 72,
    date: "Today, 2:30 PM",
    transcriptionStatus: "completed",
    waveform: [0.3, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.4, 0.7],
  },
  {
    id: "vn-002",
    title: "Product Ideas - Voice Dump",
    duration: 145,
    date: "Today, 11:15 AM",
    transcriptionStatus: "completed",
    waveform: [0.2, 0.4, 0.6, 0.3, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.4],
  },
  {
    id: "vn-003",
    title: "Call with Investor - Quick Notes",
    duration: 210,
    date: "Yesterday, 4:00 PM",
    transcriptionStatus: "completed",
    waveform: [0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.4, 0.9, 0.6, 0.3, 0.5, 0.8, 0.4, 0.7, 0.6, 0.3, 0.5, 0.9, 0.4, 0.7],
  },
  {
    id: "vn-004",
    title: "Morning Reflection",
    duration: 48,
    date: "Yesterday, 8:30 AM",
    transcriptionStatus: "processing",
    waveform: [0.5, 0.3, 0.7, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.4, 0.6, 0.3, 0.8, 0.5, 0.4, 0.7, 0.6, 0.3, 0.5, 0.8],
  },
  {
    id: "vn-005",
    title: "Feature Brainstorm - Debo Voice",
    duration: 95,
    date: "May 17",
    transcriptionStatus: "completed",
    waveform: [0.6, 0.4, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.4, 0.6, 0.9, 0.3, 0.5, 0.8, 0.4],
  },
];
