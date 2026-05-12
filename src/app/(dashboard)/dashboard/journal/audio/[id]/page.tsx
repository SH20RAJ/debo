import { getJournalEntry } from "@/actions/media-journals";
import { MediaJournalView } from "@/components/journal/media-journal-view";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const resolvedParams = await params;
    const journal = await getJournalEntry(resolvedParams.id, "audio");
    if (!journal) return { title: "Audio Not Found" };

    return { 
        title: journal.title || "Audio Moment",
        description: journal.transcript || "An audio memory captured in Debo."
    };
}

export default async function AudioJournalPage({ 
    params
}: { 
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const entry = await getJournalEntry(resolvedParams.id, "audio");
    
    if (!entry || entry.type !== "audio") {
        notFound();
    }

    return (
        <MediaJournalView 
            id={entry.id}
            type="audio"
            title={entry.title || ""}
            transcript={entry.transcript || ""}
            driveWebUrl={entry.driveWebUrl || ""}
            createdAt={entry.createdAt}
        />
    );
}
