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
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search your persistent facts..." 
            value={query}
            onChange={(e) => { setQuery(e.target.value); updateUrl(e.target.value, 1); }}
            className="pl-14 h-16 rounded-xl border border-border/50 bg-card/40 text-lg font-semibold text-foreground focus-visible:ring-primary/20 focus-visible:border-primary/40 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
            <Button 
                variant="outline"
                onClick={handleExport} 
                className="h-16 rounded-xl border-border/50 bg-card/40 text-foreground font-bold uppercase tracking-widest px-8 flex-1 lg:flex-none hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
            >
                <Download className="h-5 w-5 mr-2" /> Export
            </Button>
            <Button 
                variant="outline"
                onClick={handleImportClick} 
                disabled={isImporting} 
                className="h-16 rounded-xl border-border/50 bg-card/40 text-foreground font-bold uppercase tracking-widest px-8 flex-1 lg:flex-none hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
            >
                {isImporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />} 
                Import
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>

      {/* Add Fact Section */}
      <div className="bg-primary/5 border border-primary/10 p-8 space-y-6 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <Input 
                      placeholder="Add a new permanent fact about yourself..." 
                      value={newFact}
                      onChange={(e) => setNewFact(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      className="h-16 bg-background/50 border border-primary/10 rounded-xl text-lg font-semibold text-foreground placeholder:text-muted-foreground/30 px-6 focus-visible:ring-primary/20 focus-visible:border-primary/40 outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
              </div>
              <Button 
                onClick={handleAdd} 
                disabled={isAdding || !newFact.trim()} 
                className="h-16 px-10 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                  {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6 mr-2" />}
                  Store Fact
              </Button>
          </div>
          <p className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] text-center md:text-left">
            Stored facts are used by Debo to provide personalized context in conversations.
          </p>
      </div>

      {/* List Section */}
      <div className={cn("space-y-8 transition-opacity duration-300", isPending && "opacity-50")}>
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary">
                    <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
                    Intelligence Graph
                </h3>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary font-bold text-[10px] uppercase py-1.5 px-4 rounded-lg">
                {totalCount} Nodes
            </Badge>
        </div>
        
        {initialMemories.length === 0 ? (
            <div className="py-24 text-center space-y-8 border-dashed bg-muted/5 border border-border/50 rounded-xl">
                <div className="mx-auto h-24 w-24 bg-card border border-border/50 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/5 animate-bounce-subtle">
                    <Database className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                    <p className="text-3xl font-heading font-semibold text-foreground tracking-tight">Your graph is empty</p>
                    <p className="text-sm font-medium text-muted-foreground/40 max-w-sm mx-auto leading-relaxed italic">
                        Initialize your memory engine by storing permanent facts about your preferences, goals, or life events.
                    </p>
                </div>
            </div>
        ) : (
            <div className="grid gap-4">
                {initialMemories.map((m) => (
                    <div key={m.id} className="group flex items-center justify-between gap-8 bg-card/40 p-8 hover:bg-card/60 border border-border/50 rounded-xl transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex-1 space-y-4">
                            <p className="text-xl font-medium text-foreground leading-relaxed tracking-tight">
                                {m.content}
                            </p>
                            {m.score && m.score < 1 && (
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000" 
                                            style={{ width: `${m.score * 100}%` }} 
                                        />
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Confidence: {Math.round(m.score * 100)}%</span>
                                </div>
                            )}
                        </div>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-14 w-14 rounded-xl text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 transition-all lg:opacity-0 group-hover:opacity-100"
                                >
                                    {isDeleting === m.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <Trash2 className="h-6 w-6" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl border border-border/50 p-10 shadow-2xl bg-card">
                                <AlertDialogHeader>
                                    <div className="mx-auto h-20 w-20 bg-destructive/5 rounded-2xl flex items-center justify-center mb-6">
                                        <AlertCircle className="h-10 w-10 text-destructive/40" />
                                    </div>
                                    <AlertDialogTitle className="text-2xl font-heading font-semibold text-center text-foreground tracking-tight">Erase Memory?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-center font-medium text-muted-foreground/60 text-sm mt-4 leading-relaxed italic">
                                        This data node will be permanently purged from your long-term memory engine.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-10">
                                    <AlertDialogCancel className="bg-muted/20 border border-border/50 text-foreground h-14 rounded-xl flex-1 font-bold uppercase tracking-widest text-xs">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(m.id)}
                                        className="bg-destructive text-destructive-foreground h-14 rounded-xl flex-1 font-bold uppercase tracking-widest text-xs shadow-xl shadow-destructive/20 hover:shadow-destructive/30"
                                    >
                                        Purge Node
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
                    variant="outline"
                    disabled={currentPage <= 1 || isPending}
                    onClick={() => updateUrl(query, currentPage - 1)}
                    className="h-14 px-8 rounded-xl border-border/50 bg-card/40 text-foreground font-bold uppercase tracking-widest text-xs disabled:opacity-20 transition-all hover:bg-primary/5"
                >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Prev
                </Button>
                
                <div className="flex items-center gap-4 px-8 py-3 rounded-xl border border-border/50 bg-muted/20">
                    <span className="text-lg font-semibold text-foreground">{currentPage}</span>
                    <span className="text-lg font-bold text-muted-foreground/20">/</span>
                    <span className="text-lg font-semibold text-muted-foreground/40">{totalPages}</span>
                </div>

                <Button
                    variant="outline"
                    disabled={currentPage >= totalPages || isPending}
                    onClick={() => updateUrl(query, currentPage + 1)}
                    className="h-14 px-8 rounded-xl border-border/50 bg-card/40 text-foreground font-bold uppercase tracking-widest text-xs disabled:opacity-20 transition-all hover:bg-primary/5"
                >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
            </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-center gap-8 text-[9px] font-bold text-muted-foreground/10 uppercase tracking-[0.4em] pt-16 justify-center">
        <div className="h-px flex-1 bg-border/40 w-full" />
        <div className="flex items-center gap-4 bg-muted/5 px-6 py-2 rounded-full border border-border/20 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-primary/40" />
            Active Synchronization
        </div>
        <div className="h-px flex-1 bg-border/40 w-full" />
      </div>
    </div>
  );
}
