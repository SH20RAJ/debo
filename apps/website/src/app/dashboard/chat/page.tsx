import { ChatPage } from "@/components/chat/chat-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chat",
  description: "Talk to Debo, your private AI memory companion.",
};

export default function Page() {
  return (
    <div className="h-full">
      <ChatPage />
    </div>
  );
}
