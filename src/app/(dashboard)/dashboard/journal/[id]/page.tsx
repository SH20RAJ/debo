import { getRelatedJournals } from "@/actions/journals";
import { getJournalEntry } from "@/actions/media-journals";
import { JournalEditor } from "@/components/journal/journal-editor";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ 
    params,
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ type?: "text" | "video" | "audio" }>
}): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const type = resolvedSearchParams.type || "text";

    if (resolvedParams.id === "new") return { title: "New Memory" };

    const journal = await getJournalEntry(resolvedParams.id, type);
    if (!journal) return { title: "Memory Not Found" };

    const content = (journal as any).content || (journal as any).transcript || "";

    return { 
        title: journal.title || "Untitled Memory",
        description: content.substring(0, 160)
    };
}

export default async function JournalPage({ 
    params,
    searchParams
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ type?: "text" | "video" | "audio" }>
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const type = resolvedSearchParams.type || "text";
    
    const isNew = resolvedParams.id === "new";
    let initialContent = "";
    let initialId = "";
    let initialTitle = "";
    let initialTags: string[] = [];
    let relatedJournals: any[] = [];

    if (!isNew) {
        try {
            const journal = await getJournalEntry(resolvedParams.id, type);
            if (!journal) {
                notFound();
            }
            initialContent = (journal as any).content || (journal as any).transcript || "";
            initialId = journal.id;
            initialTitle = journal.title || "";
            initialTags = (journal as any).tags || [];

            // Fetch related journals for existing entries
            relatedJournals = await getRelatedJournals(resolvedParams.id);
        } catch {
            notFound();
        }
    }

    return (
        <JournalEditor 
            initialContent={initialContent} 
            initialId={initialId} 
            initialTitle={initialTitle} 
            initialTags={initialTags} 
            relatedJournals={relatedJournals}
        />
    );
}
