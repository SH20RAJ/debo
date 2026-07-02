import { Suspense } from "react";
import { ChatPage, ChatSkeleton } from "@/components/chat/chat-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chat Thread",
  description: "Talk to Debo, your private AI memory companion.",
};

export default async function Page({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  return (
    <div className="h-full">
      <Suspense fallback={<ChatSkeleton />}>
        <ChatPage threadId={threadId} />
      </Suspense>
    </div>
  );
}
