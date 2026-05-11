import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { getAllJournals, getAllJournalsCount } from "@/actions/media-journals";
import { JournalsGrid } from "@/components/dashboard/journal/journals-grid";
import { Metadata } from "next";

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: "asc" | "desc"; page?: string; type?: "all" | "text" | "video" | "audio" }>;
}) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const params = await searchParams;
  const query = params.q || "";
  const sort = params.sort || "desc";
  const page = parseInt(params.page || "1", 10);
  const filter = params.type || "all";
  const pageSize = 12;

  // Fetch all types of journals (text, video, audio)
  const journals = await getAllJournals(sort, pageSize, (page - 1) * pageSize, filter, user.id);
  const totalCount = await getAllJournalsCount(filter, user.id);

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Minimal Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Journal
            <span className="text-duo-macaw">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Your thoughts, captured over time.
          </p>
        </header>

        <JournalsGrid
          journals={journals}
          initialQuery={query}
          initialSort={sort}
          totalCount={totalCount}
          initialFilter={filter}
        />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Journal",
  description: "Your journal entries and memories.",
};