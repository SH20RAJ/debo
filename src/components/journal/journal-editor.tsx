"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { saveJournal } from "@/actions/journals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import dynamic from "next/dynamic";

const BlockEditor = dynamic(() => import("./block-editor"), { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-muted/20 animate-pulse rounded-2xl" />
});

export function JournalEditor({ 
    initialContent = "", 
    initialId = "", 
    initialTitle = "" 
}: { 
    initialContent?: string, 
    initialId?: string, 
    initialTitle?: string 
}) {
    const [content, setContent] = useState(initialContent);
    const [title, setTitle] = useState(initialTitle);
    const [id, setId] = useState(initialId);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const router = useRouter();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSave = useCallback(async (currentContent: string, currentId: string, currentTitle: string) => {
        if (!currentContent.trim() && !currentTitle.trim()) return currentId;
        
        setSaveStatus("saving");
        try {
            const result = await saveJournal(currentContent, currentId || undefined, currentTitle || undefined);
            
            if (result.success && result.data) {
                const newId = result.data;
                if (!currentId) {
                    setId(newId);
                    window.history.replaceState(null, "", `/dashboard/journal/${newId}`);
                }
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
                return newId;
            } else {
                toast.error(result.error || "Sync failed.");
                setSaveStatus("idle");
            }
        } catch (error) {
            setSaveStatus("idle");
        }
        return currentId;
    }, []);

    useEffect(() => {
        if (content === initialContent && title === initialTitle && id) return;
        if (!content.trim() && !title.trim() && !id) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            handleSave(content, id, title);
        }, 1500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [content, id, title, handleSave, initialContent, initialTitle]);

    return (
        <div className="w-full flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="max-w-screen-xl mx-auto w-full px-6 py-10 flex items-center justify-between">
                <Button 
                    variant="duolingo-outline" 
                    size="icon" 
                    onClick={() => router.push("/dashboard/journals")}
                    className="rounded-2xl hover-bounce h-12 w-12"
                >
                    <ArrowLeft className="h-6 w-6 text-duo-eel" />
                </Button>

                <div className="flex items-center gap-4">
                    {saveStatus === "saving" && (
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-duo-macaw animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Syncing...</span>
                        </div>
                    )}
                    {saveStatus === "saved" && (
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-duo-green animate-in fade-in zoom-in duration-300">
                            <Check className="h-4 w-4" />
                            <span>Saved</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-4xl mx-auto w-full px-6 flex-1 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-12">
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-5xl font-heading font-black tracking-tight bg-transparent border-none outline-none placeholder:text-duo-swan text-duo-eel px-0"
                    />
                    
                    <div className="min-h-[60vh] duo-editor-container">
                        <BlockEditor 
                            initialContent={content} 
                            onChange={(markdown) => setContent(markdown)} 
                        />
                    </div>
                </div>
            </main>
        </div>
    );

}
