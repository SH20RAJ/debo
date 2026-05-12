"use client";

import { Assistant } from "@/components/chat/Assistant";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <Assistant />
    </div>
  );
}
