"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  BookOpen, 
  Mic, 
  Phone, 
  Video, 
  Inbox, 
  Plug, 
  Shield, 
  Cpu, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface DeboAppDef {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "utilities" | "communication" | "core";
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  status: "active" | "beta" | "coming-soon";
}

const DEBO_APPS: DeboAppDef[] = [
  {
    id: "ask-debo",
    name: "Ask Debo",
    description: "Search and query across your unified memory graph with full source citations.",
    category: "core",
    href: "/dashboard/chat",
    icon: MessageSquare,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    badge: "AI Native",
    status: "active",
  },
  {
    id: "journal",
    name: "Journal",
    description: "Write your daily logs, thoughts, and reflections. Unlisted and public modes supported.",
    category: "productivity",
    href: "/dashboard/journal",
    icon: BookOpen,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    status: "active",
  },
  {
    id: "voice-talk",
    name: "Talk to Debo",
    description: "Interactive real-time LiveKit call session with automated recording and transcription.",
    category: "communication",
    href: "/dashboard/voice/talk",
    icon: Phone,
    color: "from-violet-500/20 to-fuchsia-500/20 text-violet-400 border-violet-500/30",
    badge: "LiveKit",
    status: "active",
  },
  {
    id: "voice-notes",
    name: "Voice Notes",
    description: "Capture and review audio logs and past calls transcribed in your library.",
    category: "communication",
    href: "/dashboard/voice",
    icon: Mic,
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    status: "active",
  },
  {
    id: "media",
    name: "Media Gallery",
    description: "Browse video recordings, captured photos, and upload local files for processing.",
    category: "utilities",
    href: "/dashboard/media",
    icon: Video,
    color: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
    status: "active",
  },
  {
    id: "mail",
    name: "Debo Mail",
    description: "Premium transactional email management and AI-backed ingestion.",
    category: "communication",
    href: "/dashboard/mail",
    icon: Inbox,
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    status: "active",
  },
  {
    id: "connectors",
    name: "Connectors",
    description: "Integrate Google Drive, GitHub, Notion, and other platforms via Composio.",
    category: "productivity",
    href: "/dashboard/connectors",
    icon: Plug,
    color: "from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30",
    badge: "Composio",
    status: "active",
  },
  {
    id: "vault",
    name: "Vault",
    description: "Secure, end-to-end encrypted storage for passwords, keys, and private data.",
    category: "utilities",
    href: "/dashboard/vault",
    icon: Shield,
    color: "from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30",
    status: "active",
  },
  {
    id: "mcp",
    name: "MCP Server",
    description: "Connect external tools and IDEs to your Debo context with Model Context Protocol.",
    category: "utilities",
    href: "/dashboard/mcp",
    icon: Cpu,
    color: "from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30",
    badge: "MCP Remote",
    status: "active",
  },
];

export function DeboAppsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = DEBO_APPS.filter((app) => {
    const matchesCategory = filter === "all" || app.category === filter;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      {/* Header section with HSL tailored colors and a premium glow header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Debo Launchpad
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Debo Apps Launchpad
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Capture everything. Ask your past. Trust every answer. Tap into specialized intelligence modules and external integrations.
          </p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Glassmorphic Category tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-zinc-900/60 border border-white/5 rounded-2xl backdrop-blur-md">
          {["all", "core", "productivity", "communication", "utilities"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                filter === cat
                  ? "bg-zinc-800 text-white shadow-lg border border-white/10"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search Debo apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900/60 border-white/5 text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:border-primary/50"
          />
        </div>
      </div>

      {/* Glassmorphic App Cards Grid with hover glow and animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => {
          const Icon = app.icon;
          return (
            <Link key={app.id} href={app.href} className="group block h-full">
              <Card className="relative h-full overflow-hidden border border-white/5 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-primary/5 rounded-2xl">
                {/* Inner Glow hover element */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    {/* Icon wrapper with radial gradient background */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center border transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {app.badge && (
                        <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-zinc-300 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {app.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors duration-200 text-lg">
                          {app.name}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                    <span className="text-zinc-500 font-medium capitalize">
                      {app.category}
                    </span>
                    <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Launch App
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/5 rounded-3xl bg-zinc-900/10">
          <p className="text-zinc-500 font-medium">No apps match your query.</p>
          <button
            onClick={() => { setSearchQuery(""); setFilter("all"); }}
            className="mt-2 text-sm text-primary hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
