import { CopilotAskContainer } from "@/components/chat/CopilotAskContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask questions about your past and get evidence-backed answers from Debo.",
};

export default function AskPage() {
  return <CopilotAskContainer />;
}
