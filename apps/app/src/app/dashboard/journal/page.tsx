import { JournalPage } from "@/components/journal/journal-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal | Debo",
  description: "Write, reflect, and capture your thoughts.",
};

export default function JournalRoute() {
  return <JournalPage />;
}
