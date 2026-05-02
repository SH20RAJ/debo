import { AskAssistant } from "@/components/assistant/AskAssistant";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask questions about your past and get evidence-backed answers from Debo.",
};

export default function AskPage() {
  return <AskAssistant />;
}
