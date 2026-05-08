import { ChatContainer } from "@/components/chat/chat-container";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Chat",
    description: "Talk with Debo about your memories.",
  };
}

export default function ChatThreadPage() {
  return <ChatContainer />;
}