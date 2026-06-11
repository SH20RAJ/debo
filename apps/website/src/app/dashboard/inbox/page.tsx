import { MemoryInboxPage } from "@/components/inbox/memory-inbox-page";

export const metadata = {
  title: "Memory Inbox",
  description: "Review items Debo extracted from your memories.",
};

export default function InboxRoute() {
  return <MemoryInboxPage />;
}
