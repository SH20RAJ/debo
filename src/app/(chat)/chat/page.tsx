import { ChatExperience } from "@/components/assistant/ChatExperience";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description: "Talk with Debo about your life memories and journals.",
};

export default function ChatPage() {
  return <ChatExperience />;
}
