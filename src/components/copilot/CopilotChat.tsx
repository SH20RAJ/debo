"use client";

import { CopilotPopup } from "@copilotkit/react-ui";
import { Sparkles } from "lucide-react";
import { AgentDataRenderer } from "./AgentDataRenderer";

export function CopilotChat() {
  return (
    <>
      <AgentDataRenderer />
      <CopilotPopup
        instructions={"You are Debo's agentic companion. You can manage journals, query memories, and analyze life patterns. Be proactive and action-oriented. Use 'render_journal_card' for single journals, 'render_timeline_item' for chronological events, and 'render_insight_summary' for high-level patterns or signals."}
        labels={{
          title: "Debo Agent",
          initial: "Hi! I'm your life intelligence companion. I can help you search your past, detect patterns, or just capture a new moment. What's on your mind?",
        }}
        clickOutsideToClose={false}
      />
    </>
  );
}
