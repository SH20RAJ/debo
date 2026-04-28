import { getJournal } from "@/actions/journals";
import { JournalEditor } from "@/components/journal/journal-editor";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    if (resolvedParams.id === "new") return { title: "New Memory" };

    const journal = await getJournal(resolvedParams.id);
    if (!journal) return { title: "Memory Not Found" };

    return { 
        title: journal.title || "Untitled Memory",
        description: journal.content.substring(0, 160)
    };
}

export default async function JournalPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const isNew = resolvedParams.id === "new";
    let initialContent = "";
    let initialId = "";
    let initialTitle = "";

    if (!isNew) {
        try {
            const journal = await getJournal(resolvedParams.id);
            if (!journal) {
                notFound();
            }
            initialContent = journal.content;
            initialId = journal.id;
            initialTitle = journal.title || "";
        } catch (error) {
            notFound();
        }
    }

    return (
        <JournalEditor initialContent={initialContent} initialId={initialId} initialTitle={initialTitle} />
    );
}
