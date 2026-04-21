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
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 -mx-4 px-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-muted-foreground hover:bg-transparent hover:text-foreground transition-colors group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Archive
                </Button>
                <div className="flex items-center space-x-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold flex items-center">
                        {isSaving && <Loader2 className="h-3 w-3 mr-2 animate-spin text-primary" />}
                        {isSaving ? "Syncing" : "All changes saved"}
                    </div>

                    <Button variant="outline" size="sm" onClick={() => handleSave(content, id)} disabled={isSaving} className="rounded-full px-4 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <BlockEditor 
                    initialContent={content} 
                    onChange={(markdown) => setContent(markdown)} 
                />
            </div>
        </div>
    );
}
