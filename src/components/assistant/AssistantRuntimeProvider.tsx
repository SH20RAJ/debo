"use client";

import { AssistantRuntimeProvider, useEdgeRuntime } from "@assistant-ui/react";
import { ReactNode } from "react";

export function MyAssistantRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useEdgeRuntime({
    api: "/api/chat",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
