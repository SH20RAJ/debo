import { Metadata } from "next";

import { VoiceAgentClient } from "@/components/dashboard/experimental/agent/voice-agent-client";
import { LaunchPreview } from "@/components/landing/LaunchPreview";

const isPublicPreviewDeploy = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: "Talk to Debo",
  description: "Real-time voice intelligence for your memory palace.",
};

export default function TalkPage() {
  if (isPublicPreviewDeploy) {
    return <LaunchPreview label="Debo Talk" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <VoiceAgentClient />
    </div>
  );
}
