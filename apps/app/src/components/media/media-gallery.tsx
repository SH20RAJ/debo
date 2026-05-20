"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Mic, Image as ImageIcon, FileText, Upload, Calendar, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface MediaItem {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  summary?: string;
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
  video: "bg-purple-500/10 text-purple-500",
  audio: "bg-blue-500/10 text-blue-500",
  voice: "bg-blue-500/10 text-blue-500",
  image: "bg-pink-500/10 text-pink-500",
  journal: "bg-green-500/10 text-green-500",
  file: "bg-orange-500/10 text-orange-500",
};

export function MediaGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      const data = await api.sources.list();
      const mediaItems = (data || []).filter((s: any) =>
        ["video", "audio", "voice", "image"].includes(s.type)
      );
      setItems(mediaItems.map((s: any) => ({
        id: s.id,
        title: s.title || "Untitled",
        type: s.type,
        status: s.status || "ready",
        createdAt: s.createdAt,
        summary: s.summary || s.description,
        duration: s.duration,
      })));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="image">Photos</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" className="gap-1.5">
          <Upload className="w-3.5 h-3.5" />
          Upload
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="debo-card">
          <CardContent className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No media yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Record video, capture audio, or upload photos from the Journal page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            return (
              <Card key={item.id} className="debo-card hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[item.type] || "bg-muted"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={item.status === "ready" ? "default" : "secondary"} className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                    {item.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.createdAt)}
                    {item.duration && (
                      <span className="ml-auto">{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, "0")}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
