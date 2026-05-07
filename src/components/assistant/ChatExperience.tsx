"use client";

import { AskAssistant } from "@/components/assistant/AskAssistant";
import {
  ChatThreadUrlSync,
  MyAssistantRuntimeProvider,
} from "@/components/assistant/AssistantRuntimeProvider";

type ChatExperienceProps = {
  initialThreadId?: string | null;
};

export function ChatExperience({ initialThreadId }: ChatExperienceProps) {
  return (
    <MyAssistantRuntimeProvider initialThreadId={initialThreadId}>
      <ChatThreadUrlSync />
      <div className="h-svh overflow-hidden bg-[#071112]">
        <AskAssistant />
      </div>
    </MyAssistantRuntimeProvider>
  );
}
