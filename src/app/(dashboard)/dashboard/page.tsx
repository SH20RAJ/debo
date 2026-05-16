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
  searchParams: Promise<{ q?: string; sort?: string; sortBy?: string; page?: string; type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const userId = await resolveUserId(undefined, true);
  if (!userId) redirect("/join");

  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const query = searchParams.q || "";
  const sort = searchParams.sort === "asc" ? "asc" : "desc";
  const filter = ["all", "text", "video", "audio"].includes(searchParams.type || "")
    ? (searchParams.type as "all" | "text" | "video" | "audio")
    : "all";
  const sortBy = ["createdAt", "updatedAt", "title"].includes(searchParams.sortBy || "")
    ? (searchParams.sortBy as "createdAt" | "updatedAt" | "title")
    : "createdAt";
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const journals = await getAllJournals(sort, pageSize, offset, filter, userId, query, sortBy);
  const totalCount = await getAllJournalsCount(filter, userId, query);

  const firstName = (user.displayName ?? "there").split(" ")[0];

  return (
    <div className="min-h-full bg-background/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 lg:px-12">
        
        <header className="space-y-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-tight text-foreground">
              Welcome back, <span className="text-primary/60">{firstName}</span>.
            </h1>
            <p className="max-w-2xl text-lg md:text-xl font-medium leading-relaxed text-muted-foreground/80">
              Your personal memory palace is ready. Capture something new or explore your history.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/journal/text/new" className="minimal-card p-8 group hover:border-primary/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary/60 group-hover:scale-105 transition-transform">
                <PenLine className="h-6 w-6" />
              </div>
              <div className="mt-6 flex flex-col gap-1">
                <span className="font-semibold text-xl text-foreground tracking-tight">Text Journal</span>
                <span className="text-sm font-medium text-muted-foreground/60">Capture deep thoughts and notes</span>
              </div>
            </Link>
            
            <Link href="/dashboard/capture?type=audio" className="minimal-card p-8 group hover:border-primary/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary/60 group-hover:scale-105 transition-transform">
                <Mic2 className="h-6 w-6" />
              </div>
              <div className="mt-6 flex flex-col gap-1">
                <span className="font-semibold text-xl text-foreground tracking-tight">Audio Capture</span>
                <span className="text-sm font-medium text-muted-foreground/60">Record voice notes and meetings</span>
              </div>
            </Link>
            
            <Link href="/dashboard/capture?type=video" className="minimal-card p-8 group hover:border-primary/20 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary/60 group-hover:scale-105 transition-transform">
                <Video className="h-6 w-6" />
              </div>
              <div className="mt-6 flex flex-col gap-1">
                <span className="font-semibold text-xl text-foreground tracking-tight">Video Journal</span>
                <span className="text-sm font-medium text-muted-foreground/60">Document moments with visual context</span>
              </div>
            </Link>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-border/10 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Recent Activity</h2>
              <p className="text-sm font-medium text-muted-foreground/40 uppercase tracking-widest">History Engine</p>
            </div>
            <div className="h-1 w-12 rounded-full bg-primary/20" />
          </div>
          <JournalsGrid
            journals={journals}
            initialQuery={query}
            initialSort={sort}
            initialSortBy={sortBy}
            totalCount={totalCount}
            initialFilter={filter}
          />
        </section>
      </div>
    </div>
  );
}
