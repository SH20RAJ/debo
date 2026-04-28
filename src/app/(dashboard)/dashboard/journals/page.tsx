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
        <div className="flex-1 space-y-12 p-8 pt-6 max-w-6xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Your Archive</h1>
                <p className="text-muted-foreground text-xl">
                    Every thought, feeling, and memory recorded in Debo.
                </p>
            </div>

            <JournalListContent initialJournals={journals} />
        </div>
    );
}

export const metadata: Metadata = {
    title: "Archive — Debo",
    description: "Browse every journal entry in your personal archive.",
};
