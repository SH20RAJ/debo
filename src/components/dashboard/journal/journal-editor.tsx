"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveJournal } from "@/app/(dashboard)/dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Cloud, CheckCloud } from "lucide-react";
import BlockEditor from "./block-editor";

export function JournalEditor({ initialContent = "", initialId = "" }: { initialContent?: string, initialId?: string }) {
    const [content, setContent] = useState(initialContent);
    const [id, setId] = useState(initialId);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
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
            setLastSaved(new Date());
            return newId;
        } catch (error) {
            toast.error("Failed to sync changes.");
        } finally {
            setIsSaving(false);
        }
        return currentId;
    }, []);

    // Autosave effect
    useEffect(() => {
        if (content === initialContent && !id) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            handleSave(content, id);
        }, 2000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [content, id, handleSave, initialContent]);

    return (
        <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col">
            {/* Minimalist Top Bar */}
            <div className="flex items-center justify-between py-6 px-4 md:px-0 sticky top-0 bg-background/50 backdrop-blur-sm z-10">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push("/dashboard")} 
                    className="text-muted-foreground hover:text-foreground transition-colors -ml-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/60" />
                                <span>Syncing...</span>
                            </>
                        ) : (
                            <>
                                <Cloud className="h-3.5 w-3.5" />
                                <span>{lastSaved ? `Synced at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved'}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <BlockEditor 
                    initialContent={content} 
                    onChange={(markdown) => setContent(markdown)} 
                />
            </div>
        </div>
    );
}
