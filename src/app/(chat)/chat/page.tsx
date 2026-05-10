import { Metadata } from "next";
import { ChatExperience } from "@/components/assistant/ChatExperience";

export const metadata: Metadata = {
  title: "Chat - Debo",
  description: "Talk with Debo about your life memories and journals.",
};

export default function ChatPage() {
  return <ChatExperience />;
}