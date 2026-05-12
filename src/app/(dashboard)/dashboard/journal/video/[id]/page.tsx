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
    const journal = await getJournalEntry(resolvedParams.id, "video");
    if (!journal) return { title: "Video Not Found" };

    return { 
        title: journal.title || "Video Moment",
        description: journal.transcript || "A video memory captured in Debo."
    };
}

export default async function VideoJournalPage({ 
    params
}: { 
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const entry = await getJournalEntry(resolvedParams.id, "video");
    
    if (!entry || entry.type !== "video") {
        notFound();
    }

    return (
        <MediaJournalView 
            id={entry.id}
            type="video"
            title={entry.title || ""}
            transcript={entry.transcript || ""}
            driveWebUrl={entry.driveWebUrl || ""}
            createdAt={entry.createdAt}
        />
    );
}
