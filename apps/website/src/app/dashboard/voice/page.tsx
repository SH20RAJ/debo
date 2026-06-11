import { VoiceNotesPage } from "@/components/voice/voice-notes-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Notes | Debo",
  description: "Record and capture thoughts with voice transcripts",
};

export default function VoiceRoute() {
  return <VoiceNotesPage />;
}
