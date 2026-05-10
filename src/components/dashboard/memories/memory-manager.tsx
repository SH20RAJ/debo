"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Trash2, Plus, Loader2, Download, Upload, Database, Brain, AlertCircle, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
            toast.error(res.error || "Failed to add memory");
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
            toast.error(res.error || "Failed to delete memory");
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
                toast.error(res.error || "Failed to import memories");
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-duo-wolf transition-colors group-focus-within:text-duo-macaw" />
          <Input 
            placeholder="Search your persistent facts..." 
            value={query}
            onChange={(e) => { setQuery(e.target.value); updateUrl(e.target.value, 1); }}
            className="pl-14 h-16 rounded-2xl border-2 border-duo-swan bg-duo-snow text-lg font-bold text-duo-eel focus:border-duo-macaw outline-none transition-all shadow-[0_4px_0_var(--duo-swan)] focus:shadow-[0_4px_0_var(--duo-macaw-shadow)]"
          />
        </div>
        <div className="flex items-center gap-4">
            <Button 
                onClick={handleExport} 
                className="btn-3d btn-3d-white h-16 rounded-2xl bg-duo-snow border-2 border-duo-swan text-duo-eel font-black uppercase tracking-wider px-8 flex-1 lg:flex-none"
            >
                <Download className="h-5 w-5 mr-2" /> Export
            </Button>
            <Button 
                onClick={handleImportClick} 
                disabled={isImporting} 
                className="btn-3d btn-3d-white h-16 rounded-2xl bg-duo-snow border-2 border-duo-swan text-duo-eel font-black uppercase tracking-wider px-8 flex-1 lg:flex-none"
            >
                {isImporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />} 
                Import
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>

      {/* Add Fact Section */}
      <div className="duo-card bg-duo-polar border-2 border-duo-swan p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <Input 
                      placeholder="Add a new permanent fact about yourself..." 
                      value={newFact}
                      onChange={(e) => setNewFact(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      className="h-16 bg-duo-snow border-2 border-duo-swan rounded-2xl text-lg font-bold text-duo-eel placeholder:text-duo-wolf/40 px-6 focus:border-duo-macaw outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20">
                    <Sparkles className="h-5 w-5 text-duo-macaw" />
                  </div>
              </div>
              <Button 
                onClick={handleAdd} 
                disabled={isAdding || !newFact.trim()} 
                className="btn-3d btn-3d-green h-16 px-10 rounded-2xl bg-duo-feather text-white font-black uppercase tracking-widest shadow-[0_6px_0_#46A302] active:translate-y-1.5"
              >
                  {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6 mr-2" />}
                  Store Fact
              </Button>
          </div>
          <p className="text-[11px] font-black text-duo-wolf/60 uppercase tracking-[0.1em] text-center md:text-left">
            Stored facts are used by Debo to provide personalized context in conversations.
          </p>
      </div>

      {/* List Section */}
      <div className={cn("space-y-8 transition-opacity duration-300", isPending && "opacity-50")}>
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw">
                    <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-duo-wolf">
                    Your Knowledge Base
                </h3>
            </div>
            <div className="duo-badge bg-duo-bee text-duo-eel font-black text-[11px] uppercase py-1.5 px-4 rounded-xl shadow-[0_2px_0_#E6B400]">
                {totalCount} Facts
            </div>
        </div>
        
        {initialMemories.length === 0 ? (
            <div className="py-24 text-center space-y-8 duo-card border-dashed bg-duo-polar/40 border-duo-swan">
                <div className="mx-auto h-24 w-24 bg-duo-snow border-2 border-duo-swan rounded-[2rem] flex items-center justify-center shadow-[0_6px_0_var(--duo-swan)] animate-bounce-subtle">
                    <Database className="h-10 w-10 text-duo-swan" />
                </div>
                <div className="space-y-3">
                    <p className="text-3xl font-heading font-black text-duo-eel">Your mind is clear</p>
                    <p className="text-base font-bold text-duo-wolf max-w-sm mx-auto leading-relaxed">
                        You haven't stored any persistent facts yet. Add something above to get started!
                    </p>
                </div>
            </div>
        ) : (
            <div className="grid gap-6">
                {initialMemories.map((m) => (
                    <div key={m.id} className="duo-card group flex items-center justify-between gap-8 bg-duo-snow p-8 hover:bg-duo-polar border-2 border-duo-swan shadow-[0_6px_0_var(--duo-swan)] transition-all hover:-translate-y-1.5 active:translate-y-1">
                        <div className="flex-1 space-y-2">
                            <p className="text-xl font-bold text-duo-eel leading-relaxed">
                                {m.content}
                            </p>
                            {m.score && m.score < 1 && (
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-duo-swan rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-duo-macaw transition-all duration-1000" 
                                            style={{ width: `${m.score * 100}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-duo-wolf uppercase tracking-widest">Confidence: {Math.round(m.score * 100)}%</span>
                                </div>
                            )}
                        </div>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-14 w-14 rounded-2xl text-duo-wolf hover:text-duo-cardinal hover:bg-duo-cardinal/10 border-2 border-transparent hover:border-duo-cardinal/30 transition-all sm:opacity-0 group-hover:opacity-100"
                                >
                                    {isDeleting === m.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <Trash2 className="h-6 w-6" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem] border-4 border-duo-swan p-10 shadow-2xl bg-duo-snow max-w-md">
                                <AlertDialogHeader>
                                    <div className="mx-auto h-20 w-20 bg-duo-cardinal/10 rounded-3xl flex items-center justify-center mb-6">
                                        <AlertCircle className="h-10 w-10 text-duo-cardinal" />
                                    </div>
                                    <AlertDialogTitle className="text-3xl font-heading font-black text-center text-duo-eel">Delete Memory?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-center font-bold text-duo-wolf text-base mt-4 leading-relaxed">
                                        This fact will be removed from your long-term memory engine. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-col sm:flex-row gap-5 mt-10">
                                    <AlertDialogCancel className="btn-3d btn-3d-white bg-duo-snow border-2 border-duo-swan text-duo-eel h-16 rounded-2xl flex-1 font-black uppercase tracking-widest">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(m.id)}
                                        className="btn-3d btn-3d-red bg-duo-cardinal text-white h-16 rounded-2xl flex-1 font-black uppercase tracking-widest shadow-[0_6px_0_#E53535] active:translate-y-1.5"
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
            <div className="flex items-center justify-center gap-8 pt-16">
                <Button
                    disabled={currentPage <= 1 || isPending}
                    onClick={() => updateUrl(query, currentPage - 1)}
                    className="btn-3d btn-3d-white h-16 px-10 rounded-2xl bg-duo-snow border-2 border-duo-swan text-duo-eel font-black uppercase tracking-widest disabled:opacity-40 shadow-[0_6px_0_var(--duo-swan)] active:translate-y-1.5"
                >
                    <ChevronLeft className="h-6 w-6 mr-3" />
                    Prev
                </Button>
                
                <div className="flex items-center gap-3 px-8 py-3 rounded-2xl border-2 border-duo-swan bg-duo-polar shadow-inner">
                    <span className="text-2xl font-black text-duo-eel">{currentPage}</span>
                    <span className="text-2xl font-black text-duo-swan">/</span>
                    <span className="text-2xl font-black text-duo-wolf">{totalPages}</span>
                </div>

                <Button
                    disabled={currentPage >= totalPages || isPending}
                    onClick={() => updateUrl(query, currentPage + 1)}
                    className="btn-3d btn-3d-white h-16 px-10 rounded-2xl bg-duo-snow border-2 border-duo-swan text-duo-eel font-black uppercase tracking-widest disabled:opacity-40 shadow-[0_6px_0_var(--duo-swan)] active:translate-y-1.5"
                >
                    Next
                    <ChevronRight className="h-6 w-6 ml-3" />
                </Button>
            </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-center gap-6 text-[12px] font-black text-duo-swan uppercase tracking-[0.3em] pt-16 justify-center">
        <div className="h-1 flex-1 bg-duo-swan/20 rounded-full w-full" />
        <div className="flex items-center gap-4 bg-duo-polar px-6 py-2 rounded-full border-2 border-duo-swan/30 shrink-0">
            <Sparkles className="h-4 w-4 text-duo-bee" />
            Synchronized with Primary Memory
        </div>
        <div className="h-1 flex-1 bg-duo-swan/20 rounded-full w-full" />
      </div>
    </div>
  );
}
