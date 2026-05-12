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
    <div className="min-h-full bg-background/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <header className="space-y-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-6xl font-heading font-black tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Hi, <span className="text-duo-macaw">{firstName}</span>.
            </h1>
            <p className="max-w-2xl text-2xl font-bold leading-relaxed text-muted-foreground">
              Ready to grow your <span className="text-foreground decoration-duo-bee decoration-4 underline underline-offset-8">memory palace</span> today?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <Link href="/dashboard/journal/new" className="group flex flex-col items-start gap-6 rounded-[2.5rem] border-2 border-duo-fox/30 bg-card p-8 transition-all hover:-translate-y-2 hover:border-duo-fox hover:shadow-[0_12px_0_var(--duo-fox-shadow)] active:translate-y-1 active:shadow-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-duo-fox/10 border-2 border-duo-fox text-duo-fox shadow-[0_6px_0_var(--duo-fox-shadow)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <PenLine className="h-8 w-8" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-black text-2xl text-foreground">Text</span>
                <span className="text-sm font-bold text-muted-foreground">Pen down your deep thoughts</span>
              </div>
            </Link>
            
            <Link href="/dashboard/capture?type=audio" className="group flex flex-col items-start gap-6 rounded-[2.5rem] border-2 border-duo-macaw/30 bg-card p-8 transition-all hover:-translate-y-2 hover:border-duo-macaw hover:shadow-[0_12px_0_var(--duo-macaw-shadow)] active:translate-y-1 active:shadow-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw shadow-[0_6px_0_var(--duo-macaw-shadow)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <Mic2 className="h-8 w-8" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-black text-2xl text-foreground">Audio</span>
                <span className="text-sm font-bold text-muted-foreground">Capture the sound of life</span>
              </div>
            </Link>
            
            <Link href="/dashboard/capture?type=video" className="group flex flex-col items-start gap-6 rounded-[2.5rem] border-2 border-duo-beetle/30 bg-card p-8 transition-all hover:-translate-y-2 hover:border-duo-beetle hover:shadow-[0_12px_0_var(--duo-beetle-shadow)] active:translate-y-1 active:shadow-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-duo-beetle/10 border-2 border-duo-beetle text-duo-beetle shadow-[0_12px_0_var(--duo-beetle-shadow)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Video className="h-8 w-8" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-black text-2xl text-foreground">Video</span>
                <span className="text-sm font-bold text-muted-foreground">Document visual moments</span>
              </div>
            </Link>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b-4 border-muted/20 pb-4">
            <h2 className="text-3xl font-heading font-black text-foreground uppercase tracking-tight">Recent Journals</h2>
            <div className="h-1.5 w-24 rounded-full bg-duo-macaw/40" />
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
