import { ChatContainer } from "@/components/chat/ChatContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask questions about your past and get evidence-backed answers from Debo.",
};

export default function AskPage() {
  return <ChatContainer />;
}
