import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getJournals } from "@/actions/journals";
import { JournalListContent } from "@/components/journal/journal-list-content";
import { Metadata } from "next";

export default async function JournalsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/join");

    const journals = await getJournals("desc", 100);

    return (
        <div className="flex-1 bg-background">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
                <header className="space-y-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Archive
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight">Your life, every thought</h1>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                            Browse every journal entry recorded in your personal database.
                        </p>
                    </div>
                </header>

                <JournalListContent initialJournals={journals} />
            </div>
        </div>
    );
}

export const metadata: Metadata = {
    title: "Archive",
    description: "Browse every journal entry in your personal archive.",
};
