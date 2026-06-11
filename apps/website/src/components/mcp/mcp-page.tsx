"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@stackframe/stack";
import {
  Key,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function McpPage() {
  const user = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Auto-fetch or generate token when user is loaded
  useEffect(() => {
    if (user) {
      user.getAccessToken().then((t) => {
        if (t) setToken(t);
      });
    }
  }, [user]);

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

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        debo: {
          command: "bun",
          args: ["run", "src/index.ts"],
          cwd: "/absolute/path/to/debo/apps/mcp",
          env: {
            DATABASE_URL: "YOUR_DATABASE_URL",
            DEBO_USER_ID: user?.id || "your_user_id",
          },
        },
      },
    },
    null,
    2
  );

  const cliCommand = `bunx @debo/cli login ${user?.id || "user_id"}`;

  return (
    <div className="h-full flex flex-col bg-[#090d08] text-foreground p-6 overflow-y-auto scrollbar-none">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-white/5 mb-8 select-none">
        <div>
          <h1 className="text-2xl font-extrabold font-[var(--font-nunito)] tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-emerald-500" />
            Model Context Protocol (MCP)
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Connect external AI clients directly to your Debo memory graph.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold px-2.5 py-1">
            Status: Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* Left Side: Onboarding overview & token */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 bg-[#131911]/35 backdrop-blur-xl border-white/5 space-y-4">
            <div className="flex items-center gap-2.5 select-none">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">How it works</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MCP is an open standard that lets clients like **Claude Desktop** and **Cursor** run queries against Debo's database. It gives the AI access to your journals, tasks, and file excerpts to answer questions with full contextual citations.
            </p>
          </Card>

          {/* Access Token Card */}
          <Card className="p-5 bg-[#131911]/35 backdrop-blur-xl border-white/5 space-y-4">
            <div className="flex items-center gap-2.5 select-none">
              <Key className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">API Credentials</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use your secure Stack Auth Access Token to authenticate remote CLI or HTTP MCP connections.
            </p>

            <div className="space-y-2.5">
              {token ? (
                <div className="flex items-center gap-2 border border-white/5 bg-[#172115]/30 rounded-xl px-3 py-2">
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
                      <Check className="w-4 h-4 text-emerald-500" />
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
        <div className="lg:col-span-2">
          <Card className="bg-[#131911]/35 backdrop-blur-xl border-white/5 overflow-hidden">
            <Tabs defaultValue="cli" className="w-full">
              <TabsList className="w-full flex border-b border-white/5 bg-[#172115]/30 p-0 rounded-none h-12">
                <TabsTrigger
                  value="cli"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
                >
                  CLI Client
                </TabsTrigger>
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
              </TabsList>

              <div className="p-6">
                {/* 1. CLI GUIDE */}
                <TabsContent value="cli" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
                  <h3 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">Onboard using Debo CLI</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set up authentication profiles and register configurations automatically using our monorepo command line utility.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border border-white/5 bg-[#0a0f08] rounded-xl px-4 py-3">
                      <code className="font-mono text-xs text-emerald-400 select-all truncate">{cliCommand}</code>
                      <button
                        onClick={() => handleCopy(cliCommand, setCopiedCmd)}
                        className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 ml-4"
                      >
                        {copiedCmd ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="border border-white/5 bg-[#172115]/10 rounded-xl p-4 space-y-3.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                        <p className="leading-relaxed">Run the command above in your terminal inside the project directory to log in.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                        <p className="leading-relaxed">Register MCP inside Claude Desktop automatically by running `debo mcp install`.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                        <p className="leading-relaxed">Run semantic memory queries directly in the shell using `debo search "your query"`.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. CLAUDE DESKTOP GUIDE */}
                <TabsContent value="claude" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
                  <h3 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">Claude Desktop Configuration</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Append this block to your local Claude Desktop config file to connect:
                  </p>

                  <div className="relative border border-white/5 bg-[#0a0f08] rounded-xl overflow-hidden group">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#090d08] text-[10px] text-muted-foreground select-none">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500/60 font-semibold">claude_desktop_config.json</span>
                      <button
                        onClick={() => handleCopy(claudeConfig, setCopiedConfig)}
                        className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedConfig ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
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

                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-[#172115]/10 border border-white/5 rounded-xl p-3.5 select-none">
                    <Terminal className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground/95">Location of configuration file:</p>
                      <code className="block mt-1 font-mono text-[10px] text-emerald-400 select-all">
                        ~/Library/Application Support/Claude/claude_desktop_config.json
                      </code>
                    </div>
                  </div>
                </TabsContent>

                {/* 3. CURSOR EDITOR GUIDE */}
                <TabsContent value="cursor" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
                  <h3 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">Cursor Model Context Protocol Integration</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set up a local Stdio connection inside Cursor to make your personal history searchable directly from Cursor Composer.
                  </p>

                  <div className="border border-white/5 bg-[#172115]/10 rounded-xl p-4 space-y-4 text-xs text-muted-foreground">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground/95 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                        Navigate to Cursor Settings
                      </p>
                      <p className="pl-6 text-[11px] leading-relaxed">Open settings via Cursor Settings &rarr; Models &rarr; MCP.</p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-foreground/95 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                        Add New MCP Server
                      </p>
                      <div className="pl-6 space-y-2 mt-1">
                        <p className="text-[11px] leading-relaxed">Click **+ Add New MCP Server** and set:</p>
                        <div className="border border-white/5 bg-[#0a0f08] rounded-lg p-2.5 font-mono text-[10px] space-y-1 select-all">
                          <p><span className="text-emerald-500/70">Name:</span> debo</p>
                          <p><span className="text-emerald-500/70">Type:</span> command</p>
                          <p><span className="text-emerald-500/70">Command:</span> bun run /absolute/path/to/debo/apps/mcp/src/index.ts</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-foreground/95 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                        Environment Variables
                      </p>
                      <p className="pl-6 text-[11px] leading-relaxed">Ensure Cursor has access to your local environmental variables (`DATABASE_URL`, `DEBO_USER_ID`).</p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
