import { Greeting } from "@/components/home/greeting";
import { QuickCapture } from "@/components/home/quick-capture";
import { OpenLoops } from "@/components/home/open-loops";
import { RecentMemories } from "@/components/home/recent-memories";
import { SuggestedQuestions } from "@/components/home/suggested-questions";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <Greeting />
      <QuickCapture />
      <OpenLoops />
      <RecentMemories />
      <SuggestedQuestions />
    </div>
  );
}
