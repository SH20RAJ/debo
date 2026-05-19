import { MemoryInboxPage } from "@/components/inbox/memory-inbox-page";

export const metadata = {
  title: "Memory Inbox | Debo",
  description: "Review items Debo extracted from your memories.",
};

export default function InboxRoute() {
  return <MemoryInboxPage />;
}
