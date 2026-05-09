import { ChatExperience } from "@/components/assistant/ChatExperience";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Chat",
    description: "Talk with Debo about your memories.",
  };
}

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  return <ChatExperience initialThreadId={threadId} />;
}
