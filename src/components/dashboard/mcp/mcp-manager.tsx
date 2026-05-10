"use client"

import React, { useState } from "react"
import { 
    Copy, 
    RefreshCw, 
    Eye, 
    EyeOff, 
    Check,
    Cpu,
    Code2,
    Shield,
    Sparkles,
    MessageSquareText,
    DatabaseZap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { rotateMcpKey } from "@/actions/mcp"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface McpManagerProps {
    initialKey: string
}

export function McpManager({ initialKey }: McpManagerProps) {
    const [key, setKey] = useState(initialKey)
    const [showKey, setShowKey] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const mcpUrl = typeof window !== "undefined" ? `${window.location.origin}/api/mcp` : "https://debo.life/api/mcp"

    const handleRotate = async () => {
        if (!confirm("Are you sure you want to rotate your MCP key? Existing connections will break.")) return
        
        setIsRotating(true)
        try {
            const result = await rotateMcpKey()
            setKey(result.mcpKey)
            toast.success("MCP Key rotated successfully")
        } catch {
            toast.error("Failed to rotate key")
        } finally {
            setIsRotating(false)
        }
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success(`${field} copied to clipboard`)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const samplePrompt = `You are Debo AI - the user's personal intelligence assistant connected to their Debo Intelligence Graph.

Identity: Always identify as Debo AI when asked.

Tools Available (use maximum MCP tools freely):

## PRIMARY TOOL - USE FIRST:
- get_info: Get comprehensive life documentary with all memories, journals, patterns, and key facts in one readable article. ALWAYS call this first before using other tools to understand the user's context.

## OTHER TOOLS:
- ask_debo: Full natural chat with memory awareness (same as /chat)
- create_journal: Save new journal entries with tags and media
- update_journal: Update existing journal content or append notes
- get_journals: Fetch recent journal entries
- search_journals: Semantic search through journal history
- delete_journal: Remove journal entries
- add_memory: Store persistent facts about the user
- get_memories: Query stored memories and preferences
- get_timeline: Build chronological life event timelines
- query_graph: Analyze patterns in journals and memories
- import_ai_context: Import ChatGPT/Claude/Cursor/Gemini exports
- list_chat_threads: Browse existing Debo chat threads
- get_chat_thread: Read a specific chat thread with messages

Guidelines:
- ALWAYS call get_info FIRST to understand the user's full context before answering questions
- Use ask_debo for natural conversation with full memory context
- Always favor Debo data over generic knowledge for personal context
- Proactively use add_memory when user shares important facts
- Use search_journals/get_memories before claiming to remember something
- Import external AI context with import_ai_context when user provides exports
- Keep responses warm, concise, and action-oriented`

    const httpProbe = `curl -s ${JSON.stringify(mcpUrl)} \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
      jsonrpc: "2.0",
      id: "tools",
      method: "tools/list",
    })}'`

    const askProbe = `curl -s ${JSON.stringify(mcpUrl)} \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
      jsonrpc: "2.0",
      id: "ask",
      method: "tools/call",
      params: {
        name: "ask_debo",
        arguments: {
          message: "Give me a concise Debo check-in.",
        },
      },
    })}'`

    return (
        <div className="grid gap-8 lg:grid-cols-12 pb-20">
            <div className="lg:col-span-8 space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold tracking-tight">Security & Connection</h3>
                    </div>
                    <Card className="border border-border/50 bg-card/30 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                Access Credentials
                                <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-widest">Bearer Auth</Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                These credentials allow external agents to access your Debo tools securely.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">MCP Endpoint URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input value={mcpUrl} readOnly className="font-mono text-xs bg-muted/20 border-border/50 h-10 pr-10" />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => copyToClipboard(mcpUrl, "URL")}
                                        >
                                            {copiedField === "URL" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Bearer Token (MCP Key)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input 
                                            value={key} 
                                            type={showKey ? "text" : "password"} 
                                            readOnly 
                                            className="font-mono text-xs bg-muted/20 border-border/50 h-10 pr-20" 
                                        />
                                        <div className="absolute right-1 top-1 flex gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowKey(!showKey)}
                                            >
                                                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => copyToClipboard(key, "Key")}
                                            >
                                                {copiedField === "Key" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="h-10 border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 gap-2 transition-colors"
                                        onClick={handleRotate}
                                        disabled={isRotating}
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? "animate-spin" : ""}`} />
                                        <span className="text-xs">Rotate</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Code2 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold tracking-tight">Setup Guides</h3>
                    </div>
                    <Card className="border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                        <Tabs defaultValue="claude" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-muted/10 h-12 px-2">
                                <TabsTrigger value="claude" className="text-xs data-[state=active]:bg-background">Claude</TabsTrigger>
                                <TabsTrigger value="cursor" className="text-xs data-[state=active]:bg-background">Cursor</TabsTrigger>
                                <TabsTrigger value="agents" className="text-xs data-[state=active]:bg-background">Agents</TabsTrigger>
                                <TabsTrigger value="http" className="text-xs data-[state=active]:bg-background">HTTP Test</TabsTrigger>
                            </TabsList>
                            <TabsContent value="claude" className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Claude Desktop Configuration</h4>
                                    <p className="text-xs text-muted-foreground">Add the following to your <code className="text-foreground">claude_desktop_config.json</code>:</p>
                                </div>
                                <div className="relative group">
                                    <pre className="bg-zinc-950 p-5 rounded-xl text-[11px] text-zinc-300 overflow-x-auto font-mono border border-white/5 shadow-2xl">
{`{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": ["mcp-remote", "${mcpUrl}"],
      "headers": {
        "Authorization": "Bearer ${key}"
      }
    }
  }
}`}
                                    </pre>
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-[10px]"
                                        onClick={() => copyToClipboard(`{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": ["mcp-remote", "${mcpUrl}"],
      "headers": {
        "Authorization": "Bearer ${key}"
      }
    }
  }
}`, "Config")}
                                    >
                                        Copy JSON
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="cursor" className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Connect to Cursor</h4>
                                    <p className="text-xs text-muted-foreground">Follow these steps to integrate Debo into your IDE:</p>
                                </div>
                                <div className="grid gap-3">
                                    {[
                                        "Open Settings (Cmd + Shift + J)",
                                        "Features > MCP > Add New MCP Server",
                                        "Name: Debo | Type: Streamable HTTP",
                                        `URL: ${mcpUrl}`,
                                        "Header: Authorization = Bearer your MCP key"
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                                                {i + 1}
                                            </div>
                                            <span className="text-xs font-medium">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="agents" className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Codex, Gemini CLI, and custom agents</h4>
                                    <p className="text-xs text-muted-foreground">Use the streamable HTTP endpoint with bearer auth. The key tools are <code className="text-foreground">ask_debo</code>, <code className="text-foreground">import_ai_context</code>, and journal retrieval.</p>
                                </div>
                                <div className="grid gap-3">
                                    {[
                                        `Endpoint: ${mcpUrl}`,
                                        "Transport: Streamable HTTP / JSON-RPC 2.0",
                                        "Header: Authorization = Bearer your MCP key",
                                        "Resource: debo://profile for behavior instructions",
                                        "Prompt: debo-homie for Debo-style orchestration"
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                                                {i + 1}
                                            </div>
                                            <span className="text-xs font-medium">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="http" className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Smoke Test</h4>
                                    <p className="text-xs text-muted-foreground">
                                        This calls the MCP server&apos;s <code className="text-foreground">tools/list</code> method directly.
                                    </p>
                                </div>
                                <div className="relative group">
                                    <pre className="bg-zinc-950 p-5 rounded-xl text-[11px] text-zinc-300 overflow-x-auto font-mono border border-white/5 shadow-2xl">
{httpProbe}
                                    </pre>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-[10px]"
                                        onClick={() => copyToClipboard(httpProbe, "HTTP test")}
                                    >
                                        Copy cURL
                                    </Button>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-sm font-medium">Ask Debo through MCP</h4>
                                </div>
                                <div className="relative group">
                                    <pre className="bg-zinc-950 p-5 rounded-xl text-[11px] text-zinc-300 overflow-x-auto font-mono border border-white/5 shadow-2xl">
{askProbe}
                                    </pre>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-[10px]"
                                        onClick={() => copyToClipboard(askProbe, "Ask test")}
                                    >
                                        Copy cURL
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </section>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold tracking-tight">System Prompt</h3>
                    </div>
                    <Card className="border border-border/50 bg-primary/[0.02] backdrop-blur-sm h-fit">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary/80">Recommended Instruction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative group">
                                <div className="p-4 rounded-xl bg-background/50 text-[11px] leading-relaxed text-muted-foreground italic border border-border/30">
                                    {samplePrompt}
                                </div>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="absolute -bottom-3 -right-3 h-8 shadow-lg text-[10px] rounded-full"
                                    onClick={() => copyToClipboard(samplePrompt, "Prompt")}
                                >
                                    <Copy className="h-3 w-3 mr-2" />
                                    Copy Prompt
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold tracking-tight">Available Tools</h3>
                    </div>
                    <Card className="border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {[
                                    { name: "get_info", desc: "Get complete life documentary (primary tool - use FIRST)", icon: Sparkles },
                                    { name: "ask_debo", desc: "Natural chat with full memory context", icon: MessageSquareText },
                                    { name: "create_journal", desc: "Save new journal entries" },
                                    { name: "update_journal", desc: "Update existing journal content" },
                                    { name: "delete_journal", desc: "Remove journal entries" },
                                    { name: "get_journals", desc: "List recent journal entries" },
                                    { name: "search_journals", desc: "Semantic search through journals" },
                                    { name: "add_memory", desc: "Store persistent facts about user" },
                                    { name: "get_memories", desc: "Query stored memories & preferences" },
                                    { name: "get_timeline", desc: "Build chronological life timelines" },
                                    { name: "query_graph", desc: "Analyze patterns in journals & memories" },
                                    { name: "import_ai_context", desc: "Import ChatGPT/Claude/Cursor/Gemini exports", icon: DatabaseZap },
                                    { name: "list_chat_threads", desc: "Browse existing Debo chat threads", icon: MessageSquareText },
                                    { name: "get_chat_thread", desc: "Read specific chat thread with messages" },
                                ].map(tool => {
                                    const ToolIcon = "icon" in tool ? tool.icon : null
                                    return (
                                    <div key={tool.name} className="p-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {ToolIcon ? <ToolIcon className="h-3.5 w-3.5 text-primary" /> : null}
                                                <code className="text-[10px] font-bold text-primary font-mono">{tool.name}</code>
                                            </div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight">{tool.desc}</p>
                                    </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-4">
                            <p className="text-[10px] text-muted-foreground italic text-center w-full">
                                These are the active tools exposed by Debo&apos;s MCP server.
                            </p>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </div>
    )
}
