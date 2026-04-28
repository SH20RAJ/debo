import { ChatInterface } from "@/components/chat/chat-interface";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask | Debo",
  description: "Query your life's memories and entries with AI.",
};

export default function AskPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ask your past</h2>
        <p className="text-muted-foreground text-lg">
          Query your collective memories, journals, and life patterns.
        </p>
      </div>
      
      <ChatInterface />
    </div>
  );
}
