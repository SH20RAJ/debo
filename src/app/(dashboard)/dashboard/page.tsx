import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mic2, Video, PenLine } from "lucide-react";

import { resolveUserId } from "@/actions/auth-sync";
import { getJournals, getJournalsCount } from "@/actions/journals";
import { JournalsGrid } from "@/components/dashboard/journal/journals-grid";
import { stackServerApp } from "@/stack/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Debo Dashboard",
};

export default async function DashboardPage() {
  const userId = await resolveUserId(undefined, true);
  if (!userId) redirect("/join");

  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const pageSize = 12;
  const journals = await getJournals("desc", pageSize, 0, userId, "");
  const totalCount = await getJournalsCount("", userId);

  const firstName = (user.displayName ?? "there").split(" ")[0];

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <header className="space-y-4">
          <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-5xl">
            Hi, {firstName}.
          </h1>
          <p className="max-w-2xl text-lg font-bold leading-7 text-duo-wolf">
            Quickly capture your thoughts.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/dashboard/journal/new" className="flex items-center gap-3 rounded-2xl border-2 border-duo-fox bg-duo-orange/10 px-6 py-4 transition hover:bg-duo-orange/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border-2 border-duo-fox text-duo-orange">
                <PenLine className="h-5 w-5" />
              </div>
              <span className="font-bold text-duo-eel">Text</span>
            </Link>
            <Link href="/dashboard/capture?type=audio" className="flex items-center gap-3 rounded-2xl border-2 border-duo-macaw bg-duo-blue/10 px-6 py-4 transition hover:bg-duo-blue/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border-2 border-duo-macaw text-duo-blue">
                <Mic2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-duo-eel">Audio</span>
            </Link>
            <Link href="/dashboard/capture?type=video" className="flex items-center gap-3 rounded-2xl border-2 border-duo-beetle bg-duo-purple/10 px-6 py-4 transition hover:bg-duo-purple/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border-2 border-duo-beetle text-duo-purple">
                <Video className="h-5 w-5" />
              </div>
              <span className="font-bold text-duo-eel">Video</span>
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-black text-duo-eel">Recent Journals</h2>
          </div>
          <JournalsGrid
            journals={journals}
            initialQuery=""
            initialSort="desc"
            totalCount={totalCount}
          />
        </section>
      </div>
    </div>
  );
}
