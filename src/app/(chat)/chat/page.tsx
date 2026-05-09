import { resolveUserId } from "@/actions/auth-sync";
import { ChatExperience } from "@/components/assistant/ChatExperience";
import { isDatabaseUnavailable, logDatabaseIssue } from "@/lib/db/errors";
import { ACTIVE_THREAD_COOKIE, ensureChatThread, normalizeThreadId } from "@/lib/chat/server";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat",
  description: "Talk with Debo about your life memories and journals.",
};

export default async function ChatPage() {
  const cookieStore = await cookies();
  const activeThreadId = normalizeThreadId(cookieStore.get(ACTIVE_THREAD_COOKIE)?.value);

  if (activeThreadId) {
    redirect(`/chat/${encodeURIComponent(activeThreadId)}`);
  }

  const userId = await resolveUserId(undefined, true);
  if (userId) {
    try {
      const thread = await ensureChatThread(userId, crypto.randomUUID());
      redirect(`/chat/${encodeURIComponent(thread.id)}`);
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        logDatabaseIssue("chat page thread create", error);
      } else {
        throw error;
      }
    }
  }

  return <ChatExperience />;
}
