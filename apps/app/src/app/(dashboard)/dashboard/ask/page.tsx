import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask questions about your past and get evidence-backed answers from Debo.",
};

export default function AskPage() {
  redirect("/chat");
}
