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
  Sparkles,
  Info,
  AlertTriangle,
  Globe,
  FileCode,
  Code,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function McpPage() {
  const user = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  
  // Custom Copy States
  const [copiedHttpUrl, setCopiedHttpUrl] = useState(false);
  const [copiedPayloadList, setCopiedPayloadList] = useState(false);
  const [copiedPayloadCall, setCopiedPayloadCall] = useState(false);
  const [copiedSkillFile, setCopiedSkillFile] = useState(false);
  const [copiedCmdWorkspace, setCopiedCmdWorkspace] = useState(false);
  const [copiedCmdLink, setCopiedCmdLink] = useState(false);

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

  const cliCommand = `bun run cli login ${user?.id || "user_id"}`;
  const workspaceCmd = `bun run cli login ${user?.id || "user_id"}`;
  const linkCmd = `cd apps/cli && bun link`;
  const runGlobalCmd = `debo login ${user?.id || "user_id"}`;

  const jsonRpcList = JSON.stringify(
    {
      jsonrpc: "2.0",
      method: "tools/list",
      params: {},
      id: 1
    },
    null,
    2
  );

  const jsonRpcCall = JSON.stringify(
    {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "debo_search_memory",
        arguments: {
          query: "What is my journal entry about Apify?"
        }
      },
      id: 2
    },
    null,
    2
  );

  const skillFileContent = `## Debo Memory OS API Integration Instructions

You have access to the user's private memory graph via the Debo Model Context Protocol (MCP) server. Always prioritize searching their past thoughts and memory graph to answer contextual questions accurately.

### Available Debo MCP Tools
- \`debo_search_memory\`: Semantic text query to search notes, journals, and files. (args: \`query\`, \`limit\`)
- \`debo_get_citations\`: Retrieve full document transcripts by source ID. (args: \`sourceId\`)
- \`debo_capture_thought\`: Save raw thoughts, notes, and links. (args: \`content\`, \`title\`, \`type\`)
- \`debo_create_task\`: Create tasks/todos linked to repositories or notes. (args: \`title\`, \`description\`, \`status\`, \`dueAt\`)
- \`debo_list_journals\`: List active journal entries.
- \`debo_get_journal\`: Get full journal text content. (args: \`journalId\`)
- \`debo_create_journal\`: Add a new journal entry. (args: \`title\`, \`content\`)
- \`debo_list_media\`: Show catalog of uploaded media files.
- \`debo_list_connectors\`: Check connected data integrations (Slack, Notion, Github, etc.).
- \`debo_trigger_connector_sync\`: Force sync for a connector account. (args: \`connectorAccountId\`)

### Client Best Practices & Memory Retrieval Rules
1. Whenever the user mentions any past event, person, meeting, idea, or document, you MUST invoke \`debo_search_memory\` first.
2. If results are found, cite them using markdown linking: \`[Source Title](debo://source/<id>)\`.
3. Format output visually using visual match categories ("🟢 Strong Match", "🟡 Partial Match") to match the user's memory relevance gauge.
`;

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
              MCP is an open standard that lets clients like **Claude Desktop**, **Cursor**, and **Cline** run queries against Debo's database. It gives the AI access to your journals, tasks, and file excerpts to answer questions with full contextual citations.
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
                  value="http-mcp"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
                >
                  HTTP MCP
                </TabsTrigger>
                <TabsTrigger
                  value="claude"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
                >
                  Claude
                </TabsTrigger>
                <TabsTrigger
                  value="cursor"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
                >
                  Cursor
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold text-muted-foreground/80 h-full cursor-pointer transition-all select-none"
                >
                  Skill File
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                {/* 1. CLI GUIDE */}
                <TabsContent value="cli" className="space-y-5 focus-visible:outline-none focus-visible:ring-0 m-0">
                  {/* Warning message for bunx 404 */}
                  <div className="flex items-start gap-3 border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 text-xs text-amber-300">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="font-bold text-amber-200">Avoid "npm ERR! 404 Not Found" for @debo/cli</p>
                      <p className="mt-1 leading-relaxed text-amber-300/80">
                        Because <code className="bg-amber-950/40 px-1 py-0.5 rounded font-mono text-amber-200">@debo/cli</code> is a local workspace package inside this monorepo (not published to the public npm registry), running <code className="bg-amber-950/40 px-1 py-0.5 rounded font-mono text-amber-200">bunx @debo/cli</code> will fail. Use the local monorepo path or link the binary globally.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">Onboard using Debo CLI</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Authenticate your local command line client using one of these two methods:
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    {/* Method A */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80">Method A: Run directly in Monorepo Workspace (Recommended)</p>
                      <div className="flex items-center justify-between border border-white/5 bg-[#0a0f08] rounded-xl px-4 py-3">
                        <code className="font-mono text-xs text-emerald-400 select-all truncate">{workspaceCmd}</code>
                        <button
                          onClick={() => handleCopy(workspaceCmd, setCopiedCmdWorkspace)}
                          className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 ml-4"
                        >
                          {copiedCmdWorkspace ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Method B */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80">Method B: Link CLI Globally (Use "debo" command from anywhere)</p>
                      <div className="border border-white/5 bg-[#0a0f08] rounded-xl p-4 space-y-3 font-mono text-xs">
                        <div>
                          <p className="text-muted-foreground/60 select-none"># 1. Navigate to client and link globally</p>
                          <div className="flex items-center justify-between mt-1">
                            <code className="text-emerald-400 select-all">{linkCmd}</code>
                            <button
                              onClick={() => handleCopy(linkCmd, setCopiedCmdLink)}
                              className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                              {copiedCmdLink ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-muted-foreground/60 select-none"># 2. Login from any directory</p>
                          <div className="flex items-center justify-between mt-1">
                            <code className="text-emerald-400 select-all">{runGlobalCmd}</code>
                            <button
                              onClick={() => handleCopy(runGlobalCmd, setCopiedCmd)}
                              className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                              {copiedCmd ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-white/5 bg-[#172115]/10 rounded-xl p-4 space-y-3.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                        <p className="leading-relaxed">Run the login command above in your terminal to authenticating your identity.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                        <p className="leading-relaxed">Register MCP inside Claude Desktop automatically by running <code className="bg-white/5 px-1 py-0.5 rounded text-foreground font-mono">bun run cli mcp install</code>.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                        <p className="leading-relaxed">Run semantic memory queries directly in the shell using <code className="bg-white/5 px-1 py-0.5 rounded text-foreground font-mono">bun run cli search "query"</code>.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. HTTP MCP API GUIDE */}
                <TabsContent value="http-mcp" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
                  <h3 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">HTTP JSON-RPC MCP Server API</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Connect remote AI client extensions, Cline, or web integrations directly to the Debo MCP Server via HTTP POST requests.
                  </p>

                  <div className="space-y-4 pt-2">
                    {/* Endpoint URL */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80">API Endpoint URL</p>
                      <div className="flex items-center justify-between border border-white/5 bg-[#0a0f08] rounded-xl px-4 py-3">
                        <code className="font-mono text-xs text-emerald-400 select-all truncate">{mcpUrl}</code>
                        <button
                          onClick={() => handleCopy(mcpUrl, setCopiedHttpUrl)}
                          className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0 ml-4"
                        >
                          {copiedHttpUrl ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Request Headers */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80">Required Headers</p>
                      <div className="border border-white/5 bg-[#0a0f08] rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-1">
                        <p><span className="text-muted-foreground/60 select-none">Content-Type:</span> application/json</p>
                        <p><span className="text-muted-foreground/60 select-none">x-stack-access-token:</span> {token ? <span className="text-emerald-500 select-all truncate">{token}</span> : <span className="text-amber-500 select-none">&lt;Retrieve Access Token from left panel&gt;</span>}</p>
                      </div>
                    </div>

                    {/* Payload Example 1 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80">List Tools Payload (POST)</p>
                      <div className="relative border border-white/5 bg-[#0a0f08] rounded-xl overflow-hidden group">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#090d08] text-[10px] text-muted-foreground select-none">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500/60 font-semibold">tools/list</span>
                          <button
                            onClick={() => handleCopy(jsonRpcList, setCopiedPayloadList)}
                            className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {copiedPayloadList ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Payload</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-foreground/80 scrollbar-none whitespace-pre">
                          {jsonRpcList}
                        </pre>
                      </div>
                    </div>

                    {/* Payload Example 2 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80">Call Tool Payload (POST)</p>
                      <div className="relative border border-white/5 bg-[#0a0f08] rounded-xl overflow-hidden group">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#090d08] text-[10px] text-muted-foreground select-none">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500/60 font-semibold">tools/call</span>
                          <button
                            onClick={() => handleCopy(jsonRpcCall, setCopiedPayloadCall)}
                            className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {copiedPayloadCall ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Payload</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-foreground/80 scrollbar-none whitespace-pre">
                          {jsonRpcCall}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 3. CLAUDE DESKTOP GUIDE */}
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

                {/* 4. CURSOR EDITOR GUIDE */}
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

                {/* 5. SKILL FILE / CUSTOM INSTRUCTIONS */}
                <TabsContent value="skills" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 m-0">
                  <h3 className="text-sm font-bold text-foreground/90 font-[var(--font-nunito)]">AI Client custom Rules & Skill File (.cursorrules / .clinerules)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Paste this instruction profile into your AI client rules settings or project rule files (<code className="bg-white/5 px-1 py-0.5 rounded font-mono">.cursorrules</code> or <code className="bg-white/5 px-1 py-0.5 rounded font-mono">.clinerules</code>) to ground the AI in using your memory graph correctly.
                  </p>

                  <div className="relative border border-white/5 bg-[#0a0f08] rounded-xl overflow-hidden group">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#090d08] text-[10px] text-muted-foreground select-none">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500/60 font-semibold">.cursorrules / .clinerules</span>
                      <button
                        onClick={() => handleCopy(skillFileContent, setCopiedSkillFile)}
                        className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSkillFile ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Skill Instructions</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-foreground/80 scrollbar-none whitespace-pre max-h-[300px] overflow-y-auto">
                      {skillFileContent}
                    </pre>
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
