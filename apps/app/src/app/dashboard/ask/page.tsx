"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotActions } from "@/components/ask/copilot-actions";
import "@copilotkit/react-ui/styles.css";

export default function AskDeboPage() {
  return (
    <div className="h-full">
      <CopilotActions />
      <CopilotChat
        labels={{
          title: "Ask Debo",
          initial: "Ask me anything about your memories...",
          placeholder: "Ask Debo about your memories...",
        }}
        className="h-full"
      />
    </div>
  );
}
