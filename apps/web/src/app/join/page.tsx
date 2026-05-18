import { Metadata } from "next";

import { LaunchCountdown } from "@/components/landing/LaunchCountdown";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";
import { launchDateLabel } from "@/lib/launch";

export const metadata: Metadata = {
  title: "Join Debo",
  description: "Join the Debo public preview waitlist.",
};

export default async function JoinPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
            Waitlist
          </div>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Debo opens public preview on {launchDateLabel}.
          </h1>
          <p className="text-lg font-medium leading-relaxed text-muted-foreground">
            Sign in is paused while we prepare the public preview. Join the waitlist and we will send access when the dashboard opens.
          </p>
          <LaunchCountdown compact />
        </div>

        <WaitlistPanel />
      </div>
    </div>
  );
}
