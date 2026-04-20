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
        <div className="max-w-4xl mx-auto py-8">
            <JournalEditor initialContent={initialContent} initialId={initialId} />
        </div>
    );
}
