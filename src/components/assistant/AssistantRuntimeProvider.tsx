"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AssistantContextValue = {
  threadId: string | null;
  setThreadId: (id: string | null) => void;
};

const AssistantContext = createContext<AssistantContextValue>({
  threadId: null,
  setThreadId: () => {},
});

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [threadId, setThreadId] = useState<string | null>(null);

  return (
    <AssistantContext.Provider value={{ threadId, setThreadId }}>
      {children}
    </AssistantContext.Provider>
  );
}

// Alias for backward compatibility with existing imports
export const MyAssistantRuntimeProvider = AssistantProvider;

export function useAssistant() {
  return useContext(AssistantContext);
}