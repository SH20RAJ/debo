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
    const journal = await getJournalEntry(resolvedParams.id, "audio");
    
    if (!journal) {
        notFound();
    }

    return (
        <MediaJournalView 
            id={journal.id}
            type="audio"
            title={journal.title || ""}
            transcript={journal.transcript || ""}
            driveWebUrl={journal.driveWebUrl || ""}
            createdAt={journal.createdAt}
        />
    );
}
