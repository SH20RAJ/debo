import { getRelatedJournals } from "@/actions/journals";
import { getJournalEntry } from "@/actions/media-journals";
import { JournalEditor } from "@/components/journal/journal-editor";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const resolvedParams = await params;

    if (resolvedParams.id === "new") return { title: "New Memory" };

    const journal = await getJournalEntry(resolvedParams.id, "text");
    if (!journal) return { title: "Memory Not Found" };

    const content = (journal as any).content || "";

    return { 
        title: journal.title || "Untitled Memory",
        description: content.substring(0, 160)
    };
}

export default async function TextJournalPage({ 
    params
}: { 
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    
    const isNew = resolvedParams.id === "new";
    let initialContent = "";
    let initialId = "";
    let initialTitle = "";
    let initialTags: string[] = [];
    let relatedJournals: any[] = [];

    if (!isNew) {
        try {
            const journal = await getJournalEntry(resolvedParams.id, "text");
            if (!journal) {
                notFound();
            }
            initialContent = (journal as any).content || "";
            initialId = journal.id;
            initialTitle = journal.title || "";
            initialTags = (journal as any).tags || [];

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
