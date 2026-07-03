"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { ConnectorCard } from "./connector-card";
import { api } from "@/lib/api";
import type { Connector } from "@/lib/types";
import { toast } from "sonner";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const PROVIDER_METADATA: Record<string, {
 name: string;
 description: string;
 icon: string;
 color: string;
 category: string;
 permission: string;
}> = {
 homeassistant: {
 name: "Home Assistant",
 description: "Control and monitor your smart home devices (lights, switches, climate, locks).",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/homeassistant.svg",
 color: "#41BDF5",
 category: "Smart Home",
 permission: "Read states and call device control services",
 },
 gmail: {
 name: "Gmail",
 description: "Sync your emails to search conversations, summaries, and action items.",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg",
 color: "#EA4335",
 category: "Productivity",
 permission: "Read-only access to emails and metadata",
 },
 google_calendar: {
 name: "Google Calendar",
 description: "Sync your schedule to cross-reference meetings, events, and timelines.",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecalendar.svg",
 color: "#4285F4",
 category: "Productivity",
 permission: "Read-only access to calendar events",
 },
 notion: {
 name: "Notion",
 description: "Import pages, databases, and workspace notes into your memory graph.",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg",
 color: "#000000",
 category: "Productivity",
 permission: "Read and import pages shared with the integration",
 },
 github: {
 name: "GitHub",
 description: "Sync repositories, pull requests, issues, and commits.",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg",
 color: "#24292e",
 category: "Productivity",
 permission: "Read access to repositories, code, and issues",
 },
 slack: {
 name: "Slack",
 description: "Index channels and direct messages for conversational context.",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg",
 color: "#4A154B",
 category: "Productivity",
 permission: "Read public channels and direct messages",
 },
 drive: {
 name: "Google Drive",
 description: "Sync PDFs, text documents, spreadsheets, and presentations.",
 icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googledrive.svg",
 color: "#34A853",
 category: "Productivity",
 permission: "Read-only access to select files and folders",
 },
};

const CATEGORIES = [
 "All",
 "Productivity",
 "Health",
 "Smart Home",
 "IoT",
 "Security",
 "Location",
 "Vehicles",
];

function normalizeConnector(raw: any): Connector & { provider: string } {
 const provider = raw.provider || "";
 const meta = PROVIDER_METADATA[provider] || {
 name: provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Unknown",
 description: "Connect this service to import data.",
 icon: `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${provider.toLowerCase()}.svg`,
 color: "#6b7280",
 category: "Productivity",
 permission: "Required scopes for read access",
 };

 const name = raw.name ?? meta.name;
 const description = raw.description ?? meta.description;
 const icon = raw.icon ?? meta.icon;
 const color = raw.color ?? meta.color;
 const category = raw.category ?? meta.category;
 const permission = raw.permission ?? meta.permission;

 return {
 id: raw.id ?? crypto.randomUUID(),
 name,
 description,
 icon,
 color,
 status: raw.status === "disconnected" ? "not_connected" : raw.status ?? "not_connected",
 permissions: [permission],
 permission,
 category,
 provider,
 } as any;
}

export function ConnectorsPage() {
 const [connectors, setConnectors] = useState<(Connector & { provider: string })[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(false);
 const [pollActive, setPollActive] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedCategory, setSelectedCategory] = useState("All");

 // Home Assistant Modal states
 const [haModalOpen, setHaModalOpen] = useState(false);
 const [haUrl, setHaUrl] = useState("");
 const [haToken, setHaToken] = useState("");
 const [haSimulated, setHaSimulated] = useState(true);
 const [haConnecting, setHaConnecting] = useState(false);

 // Fetch connectors list
 const loadList = async (showLoading = true) => {
 if (showLoading) setLoading(true);
 try {
 const data = await api.connectors.list();
 const items = Array.isArray(data) ? data : data?.connectors ?? data?.data ?? [];
 setConnectors(items.map(normalizeConnector));
 setError(false);
 } catch (err) {
 console.error("Failed to load connectors list:", err);
 setError(true);
 } finally {
 if (showLoading) setLoading(false);
 }
 };

 // Initial fetch
 useEffect(() => {
 loadList();
 }, []);

 // Poll connectors status while pollActive is true
 useEffect(() => {
 if (!pollActive) return;

 const interval = setInterval(async () => {
 try {
 const data = await api.connectors.list();
 const items = Array.isArray(data) ? data : data?.connectors ?? data?.data ?? [];
 const normalized = items.map(normalizeConnector);

 // Check if any previously disconnected connector became connected
 const hasNewConnection = normalized.some((newConn: any) => {
 const oldConn = connectors.find((c) => c.provider === newConn.provider);
 return oldConn && oldConn.status === "not_connected" && newConn.status === "connected";
 });

 setConnectors(normalized);

 if (hasNewConnection) {
 setPollActive(false);
 toast.success("Connected successfully!");
 }
 } catch (err) {
 console.error("Polling connectors failed", err);
 }
 }, 2500);

 return () => clearInterval(interval);
 }, [pollActive, connectors]);

 const handleConnect = async (provider: string) => {
 if (provider === "homeassistant") {
 setHaModalOpen(true);
 return;
 }

 try {
 const res = await api.connectors.connect(provider);
 if (res && res.redirectUrl) {
 // Open OAuth popup window
 const width = 600;
 const height = 700;
 const left = window.screen.width / 2 - width / 2;
 const top = window.screen.height / 2 - height / 2;
 window.open(
 res.redirectUrl,
 "Connect " + provider,
 `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
 );
 // Activate polling
 setPollActive(true);
 // Timeout after 2 minutes to prevent infinite background requests
 setTimeout(() => setPollActive(false), 120000);
 } else {
 toast.error("Failed to retrieve authentication link.");
 }
 } catch {
 toast.error("Error connecting service.");
 }
 };

 const handleConnectHomeAssistant = async () => {
 setHaConnecting(true);
 try {
 const res = await fetch("/api/connectors/homeassistant", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 url: haUrl,
 token: haToken,
 simulated: haSimulated,
 }),
 });
 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || "Failed to connect Home Assistant");
 }
 setHaModalOpen(false);
 
 // Refresh list
 await loadList(false);
 toast.success("Home Assistant connected successfully!");
 } catch (err: any) {
 toast.error(err.message || "Failed to connect Home Assistant");
 } finally {
 setHaConnecting(false);
 }
 };

 const handleDisconnect = async (id: string) => {
 try {
 await api.connectors.disconnect(id);
 // Refresh connectors list
 await loadList(false);
 toast.success("Disconnected successfully.");
 } catch {
 toast.error("Failed to disconnect service.");
 }
 };

 // Filter & Search Logic
 const filteredConnectors = connectors.filter((c) => {
 const matchesSearch =
 c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 c.category.toLowerCase().includes(searchQuery.toLowerCase());

 const matchesCategory =
 selectedCategory === "All" ||
 c.category.toLowerCase() === selectedCategory.toLowerCase();

 return matchesSearch && matchesCategory;
 });

 // Group filtered connectors by category for structured display
 const groupedCategories = filteredConnectors.reduce<Record<string, (Connector & { provider: string })[]>>((acc, c) => {
 const cat = c.category || "Other";
 if (!acc[cat]) acc[cat] = [];
 acc[cat].push(c);
 return acc;
 }, {});

 const categoryEntries = Object.entries(groupedCategories);

 if (loading) {
 return (
 <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
 Connector Marketplace
 </h1>
 <p className="text-sm text-muted-foreground mt-1.5">
 Securely stream timeline events, health vitals, and smart home updates directly into your private OS.
 </p>
 </div>
 </div>
 <div className="rounded-3xl border-2 border-primary/10 bg-primary/5 px-4 py-3.5 flex items-start gap-3">
 <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
 <p className="text-xs text-muted-foreground leading-relaxed">
 Data security is our foundation. Connectors authorize read-only access. You can instantly disconnect and purge any synced workspace history in one click.
 </p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {[0, 1, 2, 3, 4, 5].map((i) => (
 <div
 key={i}
 className="rounded-3xl border border-border bg-card p-5 h-48 animate-pulse shadow-sm"
 />
 ))}
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
 <div>
 <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
 Connector Marketplace
 </h1>
 <p className="text-sm text-muted-foreground mt-1.5">
 Securely stream timeline events, health vitals, and smart home updates directly into your private OS.
 </p>
 </div>
 <div className="flex flex-col items-center justify-center text-center py-20 bg-card rounded-3xl border border-border gap-4 shadow-sm">
 <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
 <ShieldCheck className="size-6 text-destructive" />
 </div>
 <div className="space-y-1">
 <h3 className="font-bold text-foreground">API Connection Error</h3>
 <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
 We couldn't reach the Dev server. Make sure the API backend is running locally.
 </p>
 </div>
 <Button onClick={() => loadList(true)} variant="outline" className="rounded-full gap-2">
 <RefreshCw className="size-3.5" /> Retry Connection
 </Button>
 </div>
 </div>
 );
 }

 return (
 <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
 {/* Page Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
 Connector Marketplace
 </h1>
 <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
 Securely stream timeline events, health vitals, and smart home updates directly into your private OS.
 </p>
 </div>
 {pollActive && (
 <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-4 py-2 rounded-full border border-primary/20 animate-pulse self-start md:self-auto">
 <Loader2 className="size-3.5 animate-spin text-primary" />
 <span className="font-medium text-primary">Awaiting authorization...</span>
 </div>
 )}
 </div>

 {/* Security Banner */}
 <div className="rounded-3xl border border-primary/15 bg-primary/5 px-4 py-3.5 flex items-start gap-3">
 <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
 <p className="text-xs text-muted-foreground leading-relaxed">
 Data security is our foundation. Connectors authorize read-only access. You can instantly disconnect and purge any synced workspace history in one click.
 </p>
 </div>

 {/* Search & Category Filter Section */}
 <div className="flex flex-col gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
 {/* Search input */}
 <div className="relative w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
 <Input
 placeholder="Search integrations by name, description, or protocol..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-border bg-muted/30 focus-visible:ring-primary focus-visible:bg-card text-sm transition-all"
 />
 </div>

 {/* Category capsule tabs */}
 <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
 <div className="flex gap-1.5">
 {CATEGORIES.map((category) => {
 const isActive = selectedCategory === category;
 return (
 <button
 key={category}
 onClick={() => setSelectedCategory(category)}
 className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
 isActive
 ? "bg-primary text-primary-foreground shadow-md hover:brightness-105"
 : "bg-secondary text-secondary-foreground hover:bg-muted/80"
 }`}
 >
 {category}
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Grid List */}
 <div className="space-y-8">
 {filteredConnectors.length === 0 ? (
 <div className="flex flex-col items-center justify-center text-center py-20 bg-card rounded-3xl border border-border gap-3 shadow-xs">
 <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
 <SlidersHorizontal className="size-5 text-muted-foreground" />
 </div>
 <div className="space-y-1">
 <h3 className="font-bold text-foreground">No integrations found</h3>
 <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
 We couldn't find any connectors matching "{searchQuery}" under category "{selectedCategory}".
 </p>
 </div>
 {(searchQuery !== "" || selectedCategory !== "All") && (
 <Button
 onClick={() => {
 setSearchQuery("");
 setSelectedCategory("All");
 }}
 variant="outline"
 className="rounded-full mt-2"
 >
 Clear Filters
 </Button>
 )}
 </div>
 ) : (
 categoryEntries.map(([category, items]) => (
 <div key={category} className="space-y-4">
 <div className="flex items-center gap-3">
 <h2 className="text-sm font-bold text-foreground tracking-wide bg-secondary/80 px-3.5 py-1 rounded-full border border-border/40">
 {category}
 </h2>
 <div className="h-[1px] bg-border/60 grow" />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {items.map((connector) => (
 <ConnectorCard
 key={connector.id}
 connector={connector}
 onConnect={handleConnect}
 onDisconnect={handleDisconnect}
 />
 ))}
 </div>
 </div>
 ))
 )}
 </div>

 {/* Home Assistant Setup Dialog */}
 <Dialog open={haModalOpen} onOpenChange={setHaModalOpen}>
 <DialogContent className="max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl">
 <DialogHeader className="space-y-2">
 <div className="size-12 rounded-2xl bg-[#41BDF5]/15 flex items-center justify-center text-2xl text-[#41BDF5] mb-2 border border-[#41BDF5]/20">
 🏠
 </div>
 <DialogTitle className="text-xl font-bold text-foreground">
 Connect Home Assistant
 </DialogTitle>
 <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
 Integrate your smart home network with Debo. Control lights, climate, smart plugs, locks, and sensors via natural agent command flows.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4 my-4">
 <div className="flex items-center justify-between p-3 rounded-2xl border border-primary/10 bg-primary/5 transition-all">
 <div className="space-y-0.5 pr-4">
 <span className="text-xs font-bold text-foreground block">
 Simulated Demo Mode
 </span>
 <span className="text-[11px] text-muted-foreground block leading-normal">
 Creates virtual mock devices to test intelligence APIs instantly without requiring a live Home Assistant configuration.
 </span>
 </div>
 <Switch
 checked={haSimulated}
 onCheckedChange={setHaSimulated}
 className="data-[state=checked]:bg-primary"
 />
 </div>

 {!haSimulated && (
 <>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground block">
 Home Assistant URL
 </label>
 <Input
 placeholder="https://your-hass-instance.duckdns.org:8123"
 value={haUrl}
 onChange={(e) => setHaUrl(e.target.value)}
 className="rounded-xl border-border bg-muted/20 text-sm focus-visible:ring-primary focus-visible:bg-card transition-all"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-muted-foreground block">
 Long-Lived Access Token
 </label>
 <Input
 type="password"
 placeholder="eyJhbGciOi..."
 value={haToken}
 onChange={(e) => setHaToken(e.target.value)}
 className="rounded-xl border-border bg-muted/20 text-sm focus-visible:ring-primary focus-visible:bg-card transition-all"
 />
 <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
 Generate this at the bottom of your Home Assistant Profile settings page.
 </p>
 </div>
 </>
 )}
 </div>

 <DialogFooter className="gap-2 sm:gap-0 mt-2">
 <Button
 variant="outline"
 onClick={() => setHaModalOpen(false)}
 className="rounded-full font-medium"
 disabled={haConnecting}
 >
 Cancel
 </Button>
 <Button
 onClick={handleConnectHomeAssistant}
 className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-medium shadow-[0_3px_0_#b53305] hover:brightness-105 active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
 disabled={haConnecting}
 >
 {haConnecting ? (
 <>
 <Loader2 className="size-4 animate-spin" />
 <span>Connecting...</span>
 </>
 ) : (
 <span>Connect Integration</span>
 )}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}

