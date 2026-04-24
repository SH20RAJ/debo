import { getJournal } from "@/app/(dashboard)/dashboard/actions";
import { JournalEditor } from "@/components/dashboard/journal-editor";
import { notFound } from "next/navigation";

export default async function JournalPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const isNew = resolvedParams.id === "new";
    let initialContent = "";
    let initialId = "";

    if (!isNew) {
        try {
            const journal = await getJournal(resolvedParams.id);
            if (!journal) {
                notFound();
            }
            initialContent = journal.content;
            initialId = journal.id;
        } catch (error) {
            notFound();
        }
    }

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-4 md:px-10 md:py-8 animate-in fade-in duration-500">
            <JournalEditor initialContent={initialContent} initialId={initialId} />
        </div>
    );
}
