import { Greeting } from "@/components/home/greeting";
import { QuickCapture } from "@/components/home/quick-capture";
import { OpenLoops } from "@/components/home/open-loops";
import { RecentMemories } from "@/components/home/recent-memories";
import { SuggestedQuestions } from "@/components/home/suggested-questions";
import { DeboChatWidget } from "@/components/home/debo-chat-widget";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <Greeting />
      <QuickCapture />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DeboChatWidget />
        <OpenLoops />
      </div>
      <RecentMemories />
      <SuggestedQuestions />
    </div>
  );
}
