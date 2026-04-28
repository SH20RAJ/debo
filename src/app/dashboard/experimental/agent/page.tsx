import { VoiceAgentClient } from "@/components/dashboard/agent/voice-agent-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Intelligence",
  description: "Talk directly to your second brain in real-time.",
};

export default function AgentPage() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:px-10 md:py-12 flex flex-col items-center justify-center">
      <VoiceAgentClient />
    </div>
  );
}
