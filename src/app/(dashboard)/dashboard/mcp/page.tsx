"use client";

import { useState, useEffect } from "react";
import { Network, Key, RefreshCw, ShieldCheck, Terminal, CheckCircle2, Copy, Trash2, PlusCircle, Database, Search, Calendar, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { rotateMCPKey, getMCPConfig } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function MCPPage() {
  const [config, setConfig] = useState<any>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getMCPConfig();
      setConfig(data);
    } catch (e) {
      toast.error("Failed to load MCP configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotate = async () => {
    setIsRotating(true);
    try {
      const newKey = await rotateMCPKey();
      setConfig((prev: any) => ({ ...prev, mcpKey: newKey }));
      toast.success("MCP API Key rotated successfully");
    } catch (e) {
      toast.error("Failed to rotate key");
    } finally {
      setIsRotating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    );
  }

  const mcpUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '';

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Key Management Section */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-none bg-muted/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-background rounded-2xl shadow-sm">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">MCP Access Control</CardTitle>
                <CardDescription>Manage your secure bridge to external AI clients.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">API Endpoint</label>
              <div className="flex items-center gap-2 bg-background p-4 rounded-2xl border shadow-sm group">
                <code className="flex-1 text-sm font-mono truncate">{mcpUrl}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(mcpUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Bearer Token</label>
              <div className="flex items-center gap-2 bg-background p-4 rounded-2xl border shadow-sm group">
                <code className="flex-1 text-sm font-mono truncate">
                  {config?.mcpKey ? '••••••••••••••••••••••••••••••••' : 'No key generated'}
                </code>
                {config?.mcpKey && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(config.mcpKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRotate} 
                  disabled={isRotating}
                  className="rounded-xl"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRotating ? 'animate-spin' : ''}`} />
                  {config?.mcpKey ? 'Rotate Key' : 'Generate Key'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Quick Start</CardTitle>
            <CardDescription>Connect to Cursor or Claude Desktop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the endpoint and token above to configure your local AI agent. This allows the agent to search your journals and manage memories directly.
            </p>
            <div className="pt-4">
                <Button variant="link" className="p-0 h-auto text-primary font-bold">
                    View Integration Guide →
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Available Capability Tools
          <div className="h-px bg-border/20 flex-1 ml-4" />
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ToolCard 
                icon={<PlusCircle className="h-5 w-5 text-blue-500" />}
                name="create_journal"
                desc="Directly append new thoughts or entries to your repository."
            />
            <ToolCard 
                icon={<Search className="h-5 w-5 text-emerald-500" />}
                name="search_journals"
                desc="Keyword search with date range and limit filtering."
            />
            <ToolCard 
                icon={<Database className="h-5 w-5 text-purple-500" />}
                name="add_memory"
                desc="Extract and store persistent facts via Mem0."
            />
            <ToolCard 
                icon={<History className="h-5 w-5 text-amber-500" />}
                name="search_memories"
                desc="Semantic retrieval of stored intelligence context."
            />
        </div>
      </div>

    </div>
  );
}

function ToolCard({ icon, name, desc }: { icon: React.ReactNode, name: string, desc: string }) {
    return (
        <Card className="border-none bg-muted/30 hover:bg-muted/50 transition-colors">
            <CardContent className="p-6 space-y-4">
                <div className="p-2.5 bg-background w-fit rounded-xl shadow-sm">
                    {icon}
                </div>
                <div>
                    <code className="text-sm font-bold text-primary">{name}</code>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {desc}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
