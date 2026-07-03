"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@stackframe/stack";
import { api } from "@/lib/api";
import {
 Key,
 Copy,
 Check,
 Terminal,
 Cpu,
 Sparkles,
 Info,
 Globe,
 Plus,
 Trash2,
 Link2,
 ShieldCheck,
 Activity,
 Server,
 Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CustomMcpServer {
 id: string;
 name: string;
 url: string;
 headersJson: string | null;
 createdAt: string;
}

export function McpPage() {
 const user = useUser();
 const [token, setToken] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [copiedToken, setCopiedToken] = useState(false);
 const [copiedHttpUrl, setCopiedHttpUrl] = useState(false);
 const [copiedClaude, setCopiedClaude] = useState(false);
 const [copiedCursor, setCopiedCursor] = useState(false);
 const [copiedCline, setCopiedCline] = useState(false);

 // Custom MCP Servers states
 const [customServers, setCustomServers] = useState<CustomMcpServer[]>([]);
 const [loadingCustom, setLoadingCustom] = useState(true);
 
 // Form states
 const [newName, setNewName] = useState("");
 const [newUrl, setNewUrl] = useState("");
 const [newHeaders, setNewHeaders] = useState("");
 const [submittingCustom, setSubmittingCustom] = useState(false);

 // Dynamic origin for HTTP MCP Server URL
 const [mcpUrl, setMcpUrl] = useState("http://localhost:3000/api/mcp");
 useEffect(() => {
 if (typeof window !== "undefined") {
 setMcpUrl(`${window.location.origin}/api/mcp`);
 }
 }, []);

 // Auto-fetch or generate token when user is loaded
 useEffect(() => {
 if (user) {
 user.getAccessToken().then((t) => {
 if (t) setToken(t);
 });
 }
 }, [user]);

 // Fetch custom MCP servers
 const fetchCustomServers = async () => {
 try {
 const data = await api.mcp.list();
 if (data) setCustomServers(data);
 } catch {
 toast.error("Failed to load custom MCP servers.");
 } finally {
 setLoadingCustom(false);
 }
 };

 useEffect(() => {
 fetchCustomServers();
 }, []);

 const handleAddCustomServer = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newName.trim() || !newUrl.trim()) {
 toast.error("Name and URL are required.");
 return;
 }

 if (newHeaders.trim()) {
 try {
 JSON.parse(newHeaders);
 } catch {
 toast.error("Headers must be valid JSON.");
 return;
 }
 }

 setSubmittingCustom(true);
 try {
 const newServer = await api.mcp.create({
 name: newName.trim(),
 url: newUrl.trim(),
 headersJson: newHeaders.trim() || undefined,
 });
 if (newServer) {
 setCustomServers((prev) => [...prev, newServer]);
 setNewName("");
 setNewUrl("");
 setNewHeaders("");
 toast.success("Custom MCP server added successfully!");
 }
 } catch (err: any) {
 toast.error(err.message || "Failed to add custom MCP server.");
 } finally {
 setSubmittingCustom(false);
 }
 };

 const handleDeleteCustomServer = async (id: string) => {
 try {
 await api.mcp.delete(id);
 setCustomServers((prev) => prev.filter((s) => s.id !== id));
 toast.success("Custom MCP server removed.");
 } catch (err: any) {
 toast.error(err.message || "Failed to remove custom MCP server.");
 }
 };

 const handleGenerateToken = async () => {
 setLoading(true);
 try {
 const t = await user?.getAccessToken();
 if (t) {
 setToken(t);
 toast.success("Stack access token generated!");
 }
 } catch {
 toast.error("Failed to generate token.");
 } finally {
 setLoading(false);
 }
 };

 const handleCopy = async (text: string, setCopiedState: (v: boolean) => void) => {
 try {
 await navigator.clipboard.writeText(text);
 setCopiedState(true);
 toast.success("Copied to clipboard!");
 setTimeout(() => setCopiedState(false), 2000);
 } catch {
 toast.error("Copy failed.");
 }
 };

 const activeToken = token || "YOUR_ACCESS_TOKEN";

 const claudeConfig = JSON.stringify(
 {
 mcpServers: {
 debo: {
 command: "npx",
 args: [
 "-y",
 "mcp-remote",
 mcpUrl,
 "-h",
 `x-stack-access-token:${activeToken}`
 ],
 },
 },
 },
 null,
 2
 );

 const cursorCommand = `npx -y mcp-remote ${mcpUrl} -h x-stack-access-token:${activeToken}`;

 const clineConfig = JSON.stringify(
 {
 command: "npx",
 args: [
 "-y",
 "mcp-remote",
 mcpUrl,
 "-h",
 `x-stack-access-token:${activeToken}`
 ]
 },
 null,
 2
 );

 return (
 <div className="h-full flex flex-col bg-background text-foreground p-6 overflow-y-auto scrollbar-none">
 {/* Title Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-border mb-8 select-none">
 <div>
 <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
 <Cpu className="w-6 h-6 text-primary" />
 Model Context Protocol (MCP)
 </h1>
 <p className="text-sm text-muted-foreground mt-1 font-medium">
 Connect external AI clients directly to your remote Debo memory graph.
 </p>
 </div>
 <div className="mt-4 md:mt-0 flex gap-2">
 <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-1">
 Status: HTTP Active
 </Badge>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
 {/* Left Side: Onboarding overview & token */}
 <div className="lg:col-span-1 space-y-6">
 <Card className="p-5 bg-card text-card-foreground border-border backdrop-blur-xl border-border space-y-4">
 <div className="flex items-center gap-2.5 select-none">
 <Sparkles className="w-4 h-4 text-primary" />
 <h2 className="text-sm font-bold text-foreground/90 ">HTTP / Remote MCP</h2>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Your Debo memory graph is served remotely over HTTP. Rather than configuring databases and code repositories locally, clients use the <code className="text-primary font-mono bg-white/5 px-1 rounded">mcp-remote</code> wrapper to bridge the connection securely.
 </p>
 </Card>

 {/* Access Token Card */}
 <Card className="p-5 bg-card text-card-foreground border-border backdrop-blur-xl border-border space-y-4">
 <div className="flex items-center gap-2.5 select-none">
 <Key className="w-4 h-4 text-primary" />
 <h2 className="text-sm font-bold text-foreground/90 ">API Credentials</h2>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Authenticate your client requests using your secure Stack Auth Access Token.
 </p>

 <div className="space-y-2.5">
 {token ? (
 <div className="flex items-center gap-2 border border-border bg-muted/30 rounded-xl px-3 py-2">
 <input
 type="password"
 readOnly
 value={token}
 className="flex-1 bg-transparent border-0 text-xs text-muted-foreground focus:ring-0 focus-visible:ring-0 truncate"
 />
 <button
 onClick={() => handleCopy(token, setCopiedToken)}
 className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
 >
 {copiedToken ? (
 <Check className="w-4 h-4 text-primary" />
 ) : (
 <Copy className="w-4 h-4" />
 )}
 </button>
 </div>
 ) : (
 <Button
 onClick={handleGenerateToken}
 disabled={loading}
 className="w-full bg-emerald-500 text-white rounded-xl h-10 font-semibold cursor-pointer shadow-[0_2px_0_#388E02] hover:bg-emerald-600"
 >
 Retrieve Access Token
 </Button>
 )}

 <div className="flex items-start gap-1.5 px-1 pt-1.5 select-none">
 <Info className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
 <span className="text-[10px] text-muted-foreground/60 leading-normal">
 Your token is linked directly to your Stack profile. Keep it secret.
 </span>
 </div>
 </div>
 </Card>
 </div>

 {/* Right Side: Setup Guides Tabs */}
 <div className="lg:col-span-2 space-y-6">
 {/* Endpoint display */}
 <Card className="p-5 bg-card text-card-foreground border-border backdrop-blur-xl border-border space-y-3">
 <div className="flex items-center gap-2.5 select-none">
 <Globe className="w-4 h-4 text-primary" />
 <h2 className="text-sm font-bold text-foreground/90 ">Remote Endpoint URL</h2>
 </div>
 <div className="flex items-center justify-between border border-border bg-muted/50 rounded-xl px-4 py-3">
 <code className="font-mono text-xs text-primary select-all truncate">{mcpUrl}</code>
 <button
 onClick={() => handleCopy(mcpUrl, setCopiedHttpUrl)}
 className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 ml-4"
 >
 {copiedHttpUrl ? (
 <Check className="w-4 h-4 text-primary" />
 ) : (
 <Copy className="w-4 h-4" />
 )}
 </button>
 </div>
 </Card>

 {/* Client Setup Guide */}
 <Card className="bg-card text-card-foreground border-border backdrop-blur-xl border-border overflow-hidden">
 <Tabs defaultValue="claude" className="w-full">
 <TabsList className="w-full flex border-b border-border bg-muted/30 p-0 rounded-none h-12">
 <TabsTrigger
 value="claude"
 className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
 >
 Claude Desktop
 </TabsTrigger>
 <TabsTrigger
 value="cursor"
 className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
 >
 Cursor Editor
 </TabsTrigger>
 <TabsTrigger
 value="cline"
 className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
 >
 Cline VS Code
 </TabsTrigger>
 </TabsList>

 <div className="p-6">
 {/* 1. CLAUDE DESKTOP GUIDE */}
 <TabsContent value="claude" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
 <h3 className="text-sm font-bold text-foreground/90 ">Claude Desktop Configuration</h3>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Append the following block to your local Claude Desktop config file to establish the bridge connection:
 </p>

 <div className="relative border border-border bg-muted/50 rounded-xl overflow-hidden group">
 <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background text-[10px] text-muted-foreground select-none">
 <span className="font-mono text-[9px] uppercase tracking-wider text-primary/60 font-semibold">claude_desktop_config.json</span>
 <button
 onClick={() => handleCopy(claudeConfig, setCopiedClaude)}
 className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
 >
 {copiedClaude ? (
 <>
 <Check className="w-3.5 h-3.5 text-primary" />
 <span className="text-primary">Copied!</span>
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5" />
 <span>Copy Config</span>
 </>
 )}
 </button>
 </div>
 <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-foreground/80 scrollbar-none whitespace-pre">
 {claudeConfig}
 </pre>
 </div>

 <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/10 border border-border rounded-xl p-3.5 select-none">
 <Terminal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
 <div>
 <p className="font-semibold text-foreground/95">Location of configuration file:</p>
 <code className="block mt-1 font-mono text-[10px] text-primary select-all">
 ~/Library/Application Support/Claude/claude_desktop_config.json
 </code>
 </div>
 </div>
 </TabsContent>

 {/* 2. CURSOR EDITOR GUIDE */}
 <TabsContent value="cursor" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
 <h3 className="text-sm font-bold text-foreground/90 ">Cursor Model Context Protocol Integration</h3>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Add the remote bridge command directly to Cursor settings to enable memory search in Cursor Composer:
 </p>

 <div className="border border-border bg-muted/10 rounded-xl p-4 space-y-4 text-xs text-muted-foreground">
 <div className="space-y-1">
 <p className="font-semibold text-foreground/95 flex items-center gap-2">
 <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
 Navigate to Cursor Settings
 </p>
 <p className="pl-6 text-[11px] leading-relaxed">Open settings via Cursor Settings &rarr; Models &rarr; MCP.</p>
 </div>

 <div className="space-y-1">
 <p className="font-semibold text-foreground/95 flex items-center gap-2">
 <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
 Add New MCP Server
 </p>
 <div className="pl-6 space-y-2 mt-1">
 <p className="text-[11px] leading-relaxed">Click **+ Add New MCP Server** and set:</p>
 <div className="border border-border bg-muted/50 rounded-lg p-3.5 font-mono text-[10px] space-y-2 select-all">
 <p><span className="text-primary/70">Name:</span> debo</p>
 <p><span className="text-primary/70">Type:</span> command</p>
 <div className="flex items-start justify-between bg-black/30 p-2 rounded border border-border">
 <span className="text-primary break-all select-all">{cursorCommand}</span>
 <button
 onClick={() => handleCopy(cursorCommand, setCopiedCursor)}
 className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 ml-3"
 >
 {copiedCursor ? (
 <Check className="w-3.5 h-3.5 text-primary" />
 ) : (
 <Copy className="w-3.5 h-3.5" />
 )}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </TabsContent>

 {/* 3. CLINE EXTENSION GUIDE */}
 <TabsContent value="cline" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
 <h3 className="text-sm font-bold text-foreground/90 ">Cline VS Code Extension</h3>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Insert the following configuration into your Cline extension settings file:
 </p>

 <div className="relative border border-border bg-muted/50 rounded-xl overflow-hidden group">
 <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background text-[10px] text-muted-foreground select-none">
 <span className="font-mono text-[9px] uppercase tracking-wider text-primary/60 font-semibold">cline_mcp_settings.json</span>
 <button
 onClick={() => handleCopy(clineConfig, setCopiedCline)}
 className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
 >
 {copiedCline ? (
 <>
 <Check className="w-3.5 h-3.5 text-primary" />
 <span className="text-primary">Copied!</span>
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5" />
 <span>Copy Settings</span>
 </>
 )}
 </button>
 </div>
 <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-foreground/80 scrollbar-none whitespace-pre">
 {clineConfig}
 </pre>
 </div>
 </TabsContent>
 </div>
 </Tabs>
 </Card>
 </div>
 </div>

 {/* 2. Custom Remote MCP Servers Section */}
 <div className="border-t border-border pt-10 mt-10 max-w-6xl">
 <div className="mb-6 select-none">
 <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
 <Server className="w-5 h-5 text-primary" />
 Connect Custom MCP Servers
 </h2>
 <p className="text-xs text-muted-foreground mt-1 font-medium">
 Connect your own remote MCP servers using custom HTTP endpoints and secure authorization headers to expose your own tools to Debo.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Add Server Form */}
 <div className="lg:col-span-1">
 <Card className="p-5 bg-card text-card-foreground border-border backdrop-blur-xl border-border space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
 Register New Server
 </h3>
 <form onSubmit={handleAddCustomServer} className="space-y-4">
 <div className="space-y-1">
 <label className="text-[11px] font-bold text-muted-foreground/80 block">Server Name</label>
 <Input
 type="text"
 required
 placeholder="e.g. My Custom Tools"
 value={newName}
 onChange={(e) => setNewName(e.target.value)}
 className="h-9.5 text-xs rounded-xl border-border bg-background placeholder:text-muted-foreground/45 focus-visible:ring-emerald-500/30"
 />
 </div>
 <div className="space-y-1">
 <label className="text-[11px] font-bold text-muted-foreground/80 block">HTTP Endpoint URL</label>
 <Input
 type="url"
 required
 placeholder="https://api.mycustommcp.com/mcp"
 value={newUrl}
 onChange={(e) => setNewUrl(e.target.value)}
 className="h-9.5 text-xs rounded-xl border-border bg-background placeholder:text-muted-foreground/45 focus-visible:ring-emerald-500/30"
 />
 </div>
 <div className="space-y-1">
 <label className="text-[11px] font-bold text-muted-foreground/80 block">
 Authorization Headers (JSON String, Optional)
 </label>
 <Textarea
 placeholder='{"Authorization": "Bearer my-secret-token"}'
 value={newHeaders}
 onChange={(e) => setNewHeaders(e.target.value)}
 className="min-h-[80px] text-xs rounded-xl border-border bg-background placeholder:text-muted-foreground/45 font-mono resize-none p-3 focus-visible:ring-emerald-500/30"
 />
 </div>
 <Button
 type="submit"
 disabled={submittingCustom}
 className="w-full bg-emerald-500 text-white rounded-xl h-10 font-semibold cursor-pointer shadow-[0_2px_0_#388E02] hover:bg-emerald-600 flex items-center justify-center gap-2 text-xs"
 >
 <Plus className="w-3.5 h-3.5" />
 {submittingCustom ? "Adding Server..." : "Connect Server"}
 </Button>
 </form>
 </Card>
 </div>

 {/* Connected Servers List */}
 <div className="lg:col-span-2">
 <Card className="p-5 bg-card text-card-foreground border-border backdrop-blur-xl border-border h-full flex flex-col justify-between min-h-[300px]">
 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
 Active Connections
 </h3>

 {loadingCustom ? (
 <div className="flex items-center justify-center py-12 text-xs text-muted-foreground/75 font-medium select-none">
 <Loader2 className="w-4 h-4 animate-spin mr-1.5 text-primary" />
 Loading custom servers...
 </div>
 ) : customServers.length === 0 ? (
 <div className="text-center py-12 border border-dashed border-border rounded-2xl select-none">
 <Server className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2.5" />
 <p className="text-xs font-bold text-muted-foreground/80">No Custom Servers Connected</p>
 <p className="text-[10px] text-muted-foreground/50 mt-1 max-w-[280px] mx-auto leading-normal">
 Expose your own APIs as tools in the chat model by registering your MCP server.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {customServers.map((server) => (
 <div
 key={server.id}
 className="flex items-start justify-between border border-border bg-muted/50 p-4 rounded-xl group hover:border-primary/40 transition-all"
 >
 <div className="flex items-start gap-3 min-w-0">
 <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
 <Link2 className="w-4 h-4 text-primary" />
 </div>
 <div className="min-w-0">
 <h4 className="text-xs font-bold text-foreground/90 truncate">
 {server.name}
 </h4>
 <code className="block text-[10px] text-muted-foreground/80 font-mono mt-0.5 truncate select-all">
 {server.url}
 </code>
 {server.headersJson && (
 <Badge variant="outline" className="mt-1.5 text-[9px] px-1.5 py-0 bg-white/5 border-border text-muted-foreground select-none font-semibold">
 <ShieldCheck className="w-2.5 h-2.5 mr-1 text-primary/80" />
 Custom Headers Active
 </Badge>
 )}
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <Badge className="bg-emerald-500/15 text-primary border border-primary/20 text-[9px] font-bold select-none px-2 py-0.5">
 <Activity className="w-2.5 h-2.5 mr-1 animate-pulse" />
 Connected
 </Badge>
 <Button
 size="icon"
 variant="ghost"
 onClick={() => handleDeleteCustomServer(server.id)}
 className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer hover:bg-destructive/10"
 title="Remove server"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </Card>
 </div>
 </div>
 </div>
 </div>
 );
}
