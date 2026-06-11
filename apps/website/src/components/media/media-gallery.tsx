"use client";

import React, { useState, useRef } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Mic, 
  Image as ImageIcon, 
  FileText, 
  Upload, 
  Calendar, 
  Loader2, 
  Trash2, 
  Download,
  Volume2
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface MediaItem {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  summary?: string;
  plainText?: string;
  duration?: number;
  thumbnailUrl?: string;
}

const typeIcons: Record<string, typeof Video> = {
  video: Video,
  audio: Mic,
  voice: Mic,
  image: ImageIcon,
  journal: FileText,
  file: FileText,
};

const typeColors: Record<string, string> = {
  video: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  audio: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  voice: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  image: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  journal: "bg-green-500/10 text-green-500 border-green-500/20",
  file: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function MediaGallery() {
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, error, mutate, isLoading } = useSWR("/api/sources", () => api.sources.list());

  const items: MediaItem[] = (data || [])
    .filter((s: any) => ["video", "audio", "voice", "image"].includes(s.type))
    .map((s: any) => ({
      id: s.id,
      title: s.title || "Untitled",
      type: s.type,
      status: s.status || "ready",
      createdAt: s.createdAt,
      summary: s.summary || s.description,
      plainText: s.plainText,
      duration: s.duration,
    }));

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.media.upload(file);
      mutate();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCardClick = async (item: MediaItem) => {
    setSelectedItem(item);
    setPreviewLoading(true);
    setPreviewUrl(null);
    setDetailItem(null);
    try {
      const [fileData, fullDetail] = await Promise.all([
        api.sources.getFileUrl(item.id),
        api.sources.get(item.id)
      ]);
      setPreviewUrl(fileData.url);
      setDetailItem(fullDetail);
    } catch (err) {
      console.error("Failed to load preview url", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await api.sources.delete(selectedItem.id);
      setSelectedItem(null);
      mutate();
    } catch (err) {
      console.error("Failed to delete media item", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,audio/*,video/*,application/pdf"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="bg-zinc-900/60 border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs font-semibold px-4">All</TabsTrigger>
            <TabsTrigger value="video" className="rounded-lg text-xs font-semibold px-4">Video</TabsTrigger>
            <TabsTrigger value="audio" className="rounded-lg text-xs font-semibold px-4">Audio</TabsTrigger>
            <TabsTrigger value="voice" className="rounded-lg text-xs font-semibold px-4">Voice</TabsTrigger>
            <TabsTrigger value="image" className="rounded-lg text-xs font-semibold px-4">Photos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          onClick={handleUploadClick} 
          disabled={uploading} 
          size="sm" 
          className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl px-5 h-9"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-white/5 bg-zinc-900/20 backdrop-blur-sm rounded-2xl">
          <CardContent className="py-20 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10">
              <Video className="w-6 h-6 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <p className="text-zinc-300 font-medium">No media found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Upload images, voice recordings, or videos using the button above to ingest them into your memory graph.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            return (
              <Card 
                key={item.id} 
                onClick={() => handleCardClick(item)}
                className="group relative overflow-hidden border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-primary/5 rounded-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${typeColors[item.type] || "bg-white/5"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${
                      item.status === "ready" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : item.status === "processing" 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" 
                        : "bg-white/5 text-zinc-400 border border-white/10"
                    }`}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-zinc-200 group-hover:text-white transition-colors duration-200 text-sm truncate">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.duration ? (
                      <span className="font-semibold text-zinc-400">
                        {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, "0")}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Premium Media Preview Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="max-w-3xl bg-zinc-950 border border-white/10 text-zinc-100 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedItem ? typeColors[selectedItem.type] : "bg-white/5"}`}>
                {selectedItem && (typeIcons[selectedItem.type] ? React.createElement(typeIcons[selectedItem.type], { className: "w-4.5 h-4.5" }) : <FileText className="w-4.5 h-4.5" />)}
              </span>
              <span className="truncate max-w-[500px]">{selectedItem?.title}</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Uploaded on {selectedItem && formatDate(selectedItem.createdAt)} • Type: <span className="capitalize">{selectedItem?.type}</span>
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-zinc-400">Fetching preview URL and details...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4">
              {/* Media viewer column */}
              <div className="md:col-span-7 flex flex-col justify-center items-center bg-zinc-900/40 border border-white/5 rounded-2xl p-4 min-h-[260px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                
                {previewUrl ? (
                  <>
                    {selectedItem?.type === "image" && (
                      <img 
                        src={previewUrl} 
                        alt={selectedItem.title} 
                        className="max-h-[300px] w-auto object-contain rounded-xl shadow-lg border border-white/5"
                      />
                    )}
                    {(selectedItem?.type === "audio" || selectedItem?.type === "voice") && (
                      <div className="w-full space-y-6 px-4">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
                            <Volume2 className="w-8 h-8 text-blue-400" />
                          </div>
                          <span className="text-sm font-semibold text-zinc-300">Audio Playback</span>
                        </div>
                        <audio controls src={previewUrl} className="w-full accent-primary" />
                      </div>
                    )}
                    {selectedItem?.type === "video" && (
                      <video 
                        controls 
                        src={previewUrl} 
                        className="max-h-[300px] w-full object-contain rounded-xl shadow-lg border border-white/5"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-zinc-500 text-sm flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-zinc-600" />
                    <span>No preview available for this file type</span>
                  </div>
                )}
              </div>

              {/* Text metadata & AI summary column */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {selectedItem?.summary && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-bold text-zinc-500 tracking-wider">AI Summary</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/5">
                        {selectedItem.summary}
                      </p>
                    </div>
                  )}

                  {detailItem?.plainText && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Transcript / Content</h4>
                      <div className="text-xs text-zinc-400 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/5 whitespace-pre-wrap max-h-[160px] overflow-y-auto scrollbar-thin">
                        {detailItem.plainText}
                      </div>
                    </div>
                  )}

                  {!selectedItem?.summary && !detailItem?.plainText && (
                    <div className="text-zinc-500 text-xs py-8 text-center border border-dashed border-white/5 rounded-2xl">
                      No transcription or summary details available yet.
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <Button 
                    variant="outline" 
                    onClick={handleDelete}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/25 border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold rounded-xl gap-2 h-10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                  {previewUrl && (
                    <Button 
                      asChild
                      className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl gap-2 h-10 transition-colors"
                    >
                      <a href={previewUrl} download={selectedItem?.title || "download"}>
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setSelectedItem(null)} className="rounded-xl font-semibold border border-white/5 hover:bg-white/5">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
