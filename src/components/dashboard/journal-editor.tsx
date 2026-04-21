"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { saveJournal } from "@/app/(dashboard)/dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import BlockEditor from "./block-editor";

export function JournalEditor({ initialContent = "", initialId = "" }: { initialContent?: string, initialId?: string }) {
    const [content, setContent] = useState(initialContent);
    const [id, setId] = useState(initialId);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSave = useCallback(async (currentContent: string, currentId: string) => {
        if (!currentContent.trim()) return currentId;
        setIsSaving(true);
        try {
            const newId = await saveJournal(currentContent, currentId || undefined);
            if (!currentId && newId) {
                setId(newId);
                window.history.replaceState(null, "", `/dashboard/journal/${newId}`);
            }
            return newId;
        } catch (error) {
            toast.error("Failed to save journal. Please try again.");
        } finally {
            setIsSaving(false);
        }
        return currentId;
    }, []);

    // Autosave effect
    useEffect(() => {
        if (content === initialContent && !id) return; // Don't autosave empty initial

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            handleSave(content, id);
        }, 1500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [content, id, handleSave, initialContent]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-muted-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground mr-4 flex items-center">
                        {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {isSaving ? "Saving..." : "Saved"}
                    </div>

                    <Button size="sm" onClick={() => handleSave(content, id)} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Now
                    </Button>
                </div>
            </div>

            <div className="min-h-[500px] border rounded-xl bg-card p-6 md:p-8 shadow-sm">
                <BlockEditor 
                    initialContent={content} 
                    onChange={(markdown) => setContent(markdown)} 
                />
            </div>
        </div>
    );
}
