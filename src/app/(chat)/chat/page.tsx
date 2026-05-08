import { ChatContainer } from "@/components/chat/chat-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description: "Talk with Debo about your life memories and journals.",
};

export default function ChatPage() {
  return <ChatContainer />;
}