"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Trash2, Plus, Loader2, Download, Upload, Database, Brain, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { addMemory, deleteMemory, importMemories } from "@/actions/memories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MemoryManager({ initialMemories = [], initialQuery = "" }: { initialMemories: any[], initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [newFact, setNewFact] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateUrl = useCallback((newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) params.set("q", newQuery); else params.delete("q");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const timer = setTimeout(() => updateUrl(val), 400);
    return () => clearTimeout(timer);
  };

  const handleAdd = async () => {
    if (!newFact.trim()) return;
    setIsAdding(true);
    try {
        const res = await addMemory(newFact);
        if (res.success) {
            toast.success("Fact added to intelligence context.");
            setNewFact("");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    } catch (e) {
        toast.error("Failed to add memory.");
    } finally {
        setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
        const res = await deleteMemory(id);
        if (res.success) {
            toast.success("Memory deleted.");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    } catch (e) {
        toast.error("Failed to delete memory.");
    } finally {
        setIsDeleting(null);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(initialMemories, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "debo_memories_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Export started.");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
        const content = event.target?.result as string;
        try {
            const res = await importMemories(content);
            if (res.success) {
                toast.success("Memories imported successfully.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Invalid file format.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search persistent facts..." 
            value={query}
            onChange={(e) => { setQuery(e.target.value); updateUrl(e.target.value); }}
            className="pl-9 h-12 rounded-2xl bg-muted/30 border-none shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={handleExport} className="rounded-xl gap-2 flex-1 md:flex-none">
                <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" onClick={handleImportClick} disabled={isImporting} className="rounded-xl gap-2 flex-1 md:flex-none">
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
                Import
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>

      {/* Add Fact Section */}
      <Card className="border-none bg-primary/5 rounded-3xl">
        <CardContent className="p-6">
            <div className="flex gap-4">
                <div className="flex-1">
                    <Input 
                        placeholder="Add a new permanent fact about yourself..." 
                        value={newFact}
                        onChange={(e) => setNewFact(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="h-12 bg-background border-none rounded-2xl shadow-sm"
                    />
                </div>
                <Button onClick={handleAdd} disabled={isAdding || !newFact.trim()} className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Store Fact
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* List Section */}
      <div className={`space-y-4 transition-opacity duration-500 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/40 px-2">
            <Brain className="h-3 w-3" />
            Active Memory Nodes: {initialMemories.length}
        </div>
        
        {initialMemories.length === 0 ? (
            <div className="py-20 text-center space-y-4 border border-dashed rounded-3xl bg-muted/5">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Database className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-medium">No facts found in your intelligence context.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {initialMemories.map((m) => (
                    <Card key={m.id} className="group border-none bg-muted/30 hover:bg-muted/50 transition-all duration-300 rounded-2xl overflow-hidden">
                        <CardContent className="p-5 flex items-center justify-between gap-4">
                            <div className="flex-1 text-sm font-medium leading-relaxed">
                                {m.content}
                            </div>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                        {isDeleting === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This fact will be removed from your long-term intelligence context. AI models will no longer have access to it.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => handleDelete(m.id)}
                                            className="bg-destructive hover:bg-destructive/90 rounded-2xl"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em] pt-12 border-t/50">
        <AlertCircle className="h-3 w-3" />
        Memories are automatically synchronized with the global intelligence layer.
      </div>
    </div>
  );
}
