"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Trash2, Plus, Loader2, Download, Upload, Database, Brain, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export interface Memory {
  id: string;
  content: string;
  source?: string;
  sourceType?: string;
  score?: number;
}

export function MemoryManager({ initialMemories = [], initialQuery = "", totalCount = 0 }: { initialMemories: Memory[], initialQuery: string, totalCount?: number }) {
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

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const updateUrl = useCallback((newQuery: string, newPage: number = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) params.set("q", newQuery); else params.delete("q");
    if (newPage > 1) params.set("page", newPage.toString()); else params.delete("page");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  const handleAdd = async () => {
    if (!newFact.trim()) return;
    setIsAdding(true);
    try {
        const res = await addMemory(newFact);
        if (res.success) {
            toast.success("Fact added to memory engine.");
            setNewFact("");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    } catch {
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
    } catch {
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
        } catch {
            toast.error("Invalid file format.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input 
            placeholder="Search persistent facts..." 
            value={query}
            onChange={(e) => { setQuery(e.target.value); updateUrl(e.target.value, 1); }}
            className="pl-10 h-10 rounded-xl border-border bg-muted/20 text-sm focus-visible:ring-primary/10"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" onClick={handleExport} className="h-10 rounded-xl gap-2 flex-1 md:flex-none text-xs font-medium border-border">
                <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting} className="h-10 rounded-xl gap-2 flex-1 md:flex-none text-xs font-medium border-border">
                {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} 
                Import
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>

      {/* Add Fact Section */}
      <div className="rounded-2xl border border-border bg-muted/10 p-4">
          <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                  placeholder="Add a new permanent fact about yourself..." 
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="h-10 bg-background border-border rounded-lg text-sm"
              />
              <Button onClick={handleAdd} disabled={isAdding || !newFact.trim()} className="h-10 px-6 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
                  Store Fact
              </Button>
          </div>
      </div>

      {/* List Section */}
      <div className={`space-y-4 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
            <Brain className="h-3 w-3" />
            Total Memories: {totalCount}
        </div>
        
        {initialMemories.length === 0 ? (
            <div className="py-20 text-center space-y-4 border border-dashed border-border rounded-2xl bg-muted/5">
                <div className="mx-auto h-12 w-12 bg-background border border-border rounded-xl flex items-center justify-center">
                    <Database className="h-5 w-5 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">No facts found</p>
                    <p className="text-xs text-muted-foreground">Your memory engine is currently empty.</p>
                </div>
            </div>
        ) : (
            <div className="grid gap-2">
                {initialMemories.map((m) => (
                    <div key={m.id} className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted/30">
                        <div className="flex-1 text-sm font-medium leading-relaxed">
                            {m.content}
                        </div>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    {isDeleting === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-semibold tracking-tight">Delete Memory?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                        This fact will be removed from your long-term memory engine.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(m.id)}
                                        className="bg-destructive hover:bg-destructive/90 rounded-xl"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
            </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || isPending}
                    onClick={() => updateUrl(query, currentPage - 1)}
                    className="rounded-xl border-border h-10 px-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Prev
                </Button>
                
                <div className="flex items-center gap-1 px-4">
                    <span className="text-sm font-bold text-foreground">{currentPage}</span>
                    <span className="text-sm font-medium text-muted-foreground/30">/</span>
                    <span className="text-sm font-medium text-muted-foreground">{totalPages}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages || isPending}
                    onClick={() => updateUrl(query, currentPage + 1)}
                    className="rounded-xl border-border h-10 px-4"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest pt-8 border-t border-border/40">
        <AlertCircle className="h-3 w-3" />
        Synchronized with the primary memory layer.
      </div>
    </div>
  );
}
