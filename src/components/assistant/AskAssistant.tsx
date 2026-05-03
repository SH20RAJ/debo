"use client";

import { Thread } from "@assistant-ui/react-ui";

export function AskAssistant() {
  return (
    <div className="flex-1 h-full bg-background flex flex-col">
      <header className="px-8 py-6 border-b border-border/40">
        <h1 className="text-2xl font-semibold tracking-tight">Intelligence Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask anything about your stored journals and memories.</p>
      </header>
      <div className="flex-1 overflow-hidden px-4 aui-root">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <Thread 
            welcome={{
              message: "I'm ready to help you navigate your memories. What would you like to know?",
            }}
          />
        </div>
      </div>
    </div>
  );
}
