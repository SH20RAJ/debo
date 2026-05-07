import { ChatExperience } from "@/components/assistant/ChatExperience";

type ChatThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = await params;

  return <ChatExperience initialThreadId={threadId} />;
}
