import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mic2, Video, PenLine } from "lucide-react";

import { resolveUserId } from "@/actions/auth-sync";
import { getAllJournals, getAllJournalsCount } from "@/actions/media-journals";
import { JournalsGrid } from "@/components/dashboard/journal/journals-grid";
import { stackServerApp } from "@/stack/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Debo Dashboard",
};

export default async function DashboardPage(props: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const userId = await resolveUserId(undefined, true);
  if (!userId) redirect("/join");

  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const query = searchParams.q || "";
  const sort = (searchParams.sort as "asc" | "desc") || "desc";
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const journals = await getAllJournals(sort, pageSize, offset, "all", userId);
  const totalCount = await getAllJournalsCount("all", userId);

  const firstName = (user.displayName ?? "there").split(" ")[0];

  return (
    <div className="min-h-full bg-duo-polar/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <header className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-heading font-black tracking-tight text-duo-eel md:text-6xl">
              Hi, {firstName}.
            </h1>
            <p className="max-w-2xl text-xl font-bold leading-7 text-duo-wolf">
              What's on your mind today?
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <Link href="/dashboard/journal/new" className="group flex items-center gap-4 rounded-[2rem] border-2 border-duo-fox bg-white p-6 transition-all hover:translate-y-[-4px] hover:shadow-[0_8px_0_var(--duo-fox-shadow)] active:translate-y-0 active:shadow-none">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-duo-orange/10 border-2 border-duo-fox text-duo-orange shadow-[0_4px_0_var(--duo-fox-shadow)] group-hover:scale-110 transition-transform">
                <PenLine className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-duo-eel">Text</span>
                <span className="text-xs font-bold text-duo-wolf">Write it down</span>
              </div>
            </Link>
            
            <Link href="/dashboard/capture?type=audio" className="group flex items-center gap-4 rounded-[2rem] border-2 border-duo-macaw bg-white p-6 transition-all hover:translate-y-[-4px] hover:shadow-[0_8px_0_var(--duo-macaw-shadow)] active:translate-y-0 active:shadow-none">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw shadow-[0_4px_0_var(--duo-macaw-shadow)] group-hover:scale-110 transition-transform">
                <Mic2 className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-duo-eel">Audio</span>
                <span className="text-xs font-bold text-duo-wolf">Voice record</span>
              </div>
            </Link>

            <Link href="/dashboard/capture?type=video" className="group flex items-center gap-4 rounded-[2rem] border-2 border-duo-beetle bg-white p-6 transition-all hover:translate-y-[-4px] hover:shadow-[0_8px_0_var(--duo-beetle-shadow)] active:translate-y-0 active:shadow-none">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-duo-purple/10 border-2 border-duo-beetle text-duo-purple shadow-[0_4px_0_var(--duo-beetle-shadow)] group-hover:scale-110 transition-transform">
                <Video className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-duo-eel">Video</span>
                <span className="text-xs font-bold text-duo-wolf">Capture life</span>
              </div>
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-black text-duo-eel">Recent Journals</h2>
          </div>
          <JournalsGrid
            journals={journals}
            initialQuery={query}
            initialSort={sort}
            totalCount={totalCount}
          />
        </section>
      </div>
    </div>
  );
}
