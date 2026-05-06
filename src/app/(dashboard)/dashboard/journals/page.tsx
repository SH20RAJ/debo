import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { getJournals } from "@/actions/journals";
import { JournalListContent } from "@/components/journal/journal-list-content";
import { Metadata } from "next";

export default async function JournalsPage() {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/join");

  const journals = await getJournals("desc", 100);

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
            <Sparkles className="h-4 w-4 text-duo-blue" />
            ARCHIVE
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel md:text-5xl lg:text-6xl">
              All your <span className="text-duo-swan">entries</span>
            </h1>
            <p className="max-w-2xl text-xl font-bold text-duo-wolf">
              Browse your past notes and memories.
            </p>
          </div>
        </header>

        <div className="relative">
          <JournalListContent initialJournals={journals} />
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse every journal entry in your personal archive.",
};
