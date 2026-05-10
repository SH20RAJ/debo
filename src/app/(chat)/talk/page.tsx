import { VoiceAgentClient } from "@/components/dashboard/experimental/agent/voice-agent-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to Debo",
  description: "Real-time voice intelligence for your memory palace.",
};

export default function TalkPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <VoiceAgentClient />
    </div>
  );
}
