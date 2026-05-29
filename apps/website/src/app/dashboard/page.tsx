import { Greeting } from "@/components/home/greeting";
import { CaptureHero } from "@/components/home/capture-hero";
import { ActionTriad } from "@/components/home/quick-capture";
import { TodayRail } from "@/components/home/today-rail";
import { OpenLoops } from "@/components/home/open-loops";
import { DeboChatWidget } from "@/components/home/debo-chat-widget";
import { RecentMemories } from "@/components/home/recent-memories";

export default function DashboardPage() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Greeting />
      </div>

      <CaptureHero />
      <ActionTriad />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        <TodayRail />
        <OpenLoops />
      </div>

      <div className="mb-6">
        <DeboChatWidget />
      </div>

      <RecentMemories />
    </div>
  );
}
