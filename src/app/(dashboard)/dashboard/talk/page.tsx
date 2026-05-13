import { VoiceAgentClient } from "@/components/dashboard/experimental/agent/voice-agent-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to Debo",
  description: "A minimal LiveKit voice room with Debo memory context.",
};

export const dynamic = "force-dynamic";

export default function TalkPage() {
  return (
    <div className="flex min-h-full flex-1 bg-background">
      <VoiceAgentClient />
    </div>
  );
}
