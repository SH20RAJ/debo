import { Greeting } from "@/components/home/greeting";
import { CaptureHero } from "@/components/home/capture-hero";
import { ActionTriad } from "@/components/home/quick-capture";
import { TodayRail } from "@/components/home/today-rail";
import { OpenLoops } from "@/components/home/open-loops";
import { DeboChatWidget } from "@/components/home/debo-chat-widget";
import { RecentMemories } from "@/components/home/recent-memories";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <Greeting />
      <CaptureHero />
      <ActionTriad />

      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
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
