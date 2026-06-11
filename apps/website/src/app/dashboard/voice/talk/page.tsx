import { VoiceTalkPage } from "@/components/voice/voice-talk-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to Debo | Debo",
  description: "Start an interactive voice call with Debo",
};

export default function VoiceTalkRoute() {
  return <VoiceTalkPage />;
}
