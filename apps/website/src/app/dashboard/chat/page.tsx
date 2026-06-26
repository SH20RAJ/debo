import { Suspense } from "react";
import { ChatPage, ChatSkeleton } from "@/components/chat/chat-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chat",
  description: "Talk to Debo, your private AI memory companion.",
};

export default function Page() {
  return (
    <div className="h-full">
      {/*
        ChatPage uses useSearchParams(), which in Next.js 16 is a dynamic
        API that requires a surrounding <Suspense> boundary. Without it the
        route throws NoSuspenseBoundaryError ("Suspense boundary not found")
        at runtime — see https://nextjs.org/docs/messages/no-suspense-boundary
      */}
      <Suspense fallback={<ChatSkeleton />}>
        <ChatPage />
      </Suspense>
    </div>
  );
}
