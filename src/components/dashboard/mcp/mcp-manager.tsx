"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { rotateMcpKey } from "@/actions/mcp"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
        <div className="flex flex-col gap-12 pb-20">
            {/* TOP ROW: CONNECTION HUB */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Endpoint Card */}
                <div className="minimal-card p-8 space-y-6 bg-card/40 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary">
                            <DatabaseZap className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-foreground tracking-tight">Connection Endpoint</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">MCP URL</label>
                        <div className="relative">
                            <Input 
                                value={mcpUrl} 
                                readOnly 
                                className="font-medium text-sm bg-muted/20 border border-border/50 rounded-xl h-14 pr-14 text-foreground focus-visible:ring-primary/20 focus-visible:border-primary/40 outline-none transition-all" 
                            />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-2 h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
                                onClick={() => copyToClipboard(mcpUrl, "URL")}
                            >
                                {copiedField === "URL" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/30 px-1 italic">Use this URL to connect external agents to your intelligence graph.</p>
                    </div>
                </div>

                {/* Auth Card */}
                <div className="minimal-card p-8 space-y-6 bg-card/40 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-heading font-semibold text-foreground tracking-tight">Security</h3>
                        </div>
                        <Badge variant="outline" className="text-primary font-bold text-[9px] uppercase border-primary/20 py-1 rounded-lg">Bearer Protocol</Badge>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Bearer Token</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Input 
                                    value={key} 
                                    type={showKey ? "text" : "password"} 
                                    readOnly 
                                    className="font-medium text-sm bg-muted/20 border border-border/50 rounded-xl h-14 pr-24 text-foreground focus-visible:ring-primary/20 focus-visible:border-primary/40 outline-none transition-all" 
                                />
                                <div className="absolute right-2 top-2 flex gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
                                        onClick={() => setShowKey(!showKey)}
                                    >
                                        {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
                                        onClick={() => copyToClipboard(key, "Key")}
                                    >
                                        {copiedField === "Key" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                            <Button 
                                onClick={handleRotate}
                                disabled={isRotating}
                                variant="outline"
                                className={cn(
                                    "h-14 w-14 rounded-xl border-border/50 text-muted-foreground hover:text-destructive hover:bg-destructive/5 p-0 shrink-0",
                                    isRotating && "opacity-50 cursor-not-allowed"
                                )}
                                title="Rotate Key"
                            >
                                <RefreshCw className={cn("h-5 w-5", isRotating && "animate-spin")} />
                            </Button>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/30 px-1 italic">Rotating your key will break existing active connections.</p>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: GUIDES & PROMPT */}
            <div className="grid gap-12 lg:grid-cols-12">
                {/* Integration Guides */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Setup Guides</h3>
                    </div>
                    
                    <div className="minimal-card p-0 overflow-hidden bg-card/40 border border-border/50">
                        <Tabs defaultValue="claude" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-muted/20 h-16 px-4 gap-2">
                                {["claude", "cursor", "agents", "http"].map((tab) => (
                                    <TabsTrigger 
                                        key={tab}
                                        value={tab} 
                                        className="text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border border-border/50 rounded-lg h-10 px-6 transition-all"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <div className="p-8">
                                <TabsContent value="claude" className="mt-0 space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-semibold text-foreground tracking-tight">Claude Desktop</h4>
                                        <p className="text-xs font-medium text-muted-foreground/60 italic">Inject protocol into `claude_desktop_config.json`:</p>
                                    </div>
                                    <div className="relative group">
                                        <pre className="bg-muted/30 p-6 rounded-2xl text-[12px] text-foreground/80 overflow-x-auto font-mono border border-border/50 shadow-inner">
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
                                            variant="outline"
                                            className="absolute top-4 right-4 h-9 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-background/50 backdrop-blur-md"
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
                                <TabsContent value="cursor" className="mt-0 space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-semibold text-foreground tracking-tight">Cursor Connection</h4>
                                        <p className="text-xs font-medium text-muted-foreground/60 italic">Configure in Cursor Settings:</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            "Open Settings (Cmd + Shift + J)",
                                            "Features > MCP > Add New MCP Server",
                                            "Name: Debo | Type: Streamable HTTP",
                                            `URL: ${mcpUrl}`,
                                            "Header: Authorization = Bearer [Your Key]"
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center gap-5 p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/20 transition-colors">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[10px]">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-medium text-foreground/80">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="agents" className="mt-0 space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-semibold text-foreground tracking-tight">Custom Implementation</h4>
                                        <p className="text-xs font-medium text-muted-foreground/60 italic">Developer protocol specifications:</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            `Endpoint: ${mcpUrl}`,
                                            "Transport: Streamable HTTP / JSON-RPC 2.0",
                                            "Header: Authorization = Bearer [Your Key]",
                                            "Resource: debo://profile for behavior instructions",
                                            "Prompt: debo-homie for Debo-style orchestration"
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center gap-5 p-4 rounded-xl bg-muted/20 border border-border/50">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-[10px]">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-medium text-foreground/80">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="http" className="mt-0 space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-semibold text-foreground tracking-tight text-center">Protocol Smoke Test</h4>
                                            <p className="text-xs font-medium text-muted-foreground/60 text-center italic">Verify handshake via cURL:</p>
                                        </div>
                                        <div className="relative group">
                                            <pre className="bg-muted/30 p-6 rounded-2xl text-[12px] text-foreground/80 overflow-x-auto font-mono border border-border/50">
{httpProbe}
                                            </pre>
                                            <Button
                                                variant="outline"
                                                className="absolute top-4 right-4 h-9 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-background/50 backdrop-blur-md"
                                                onClick={() => copyToClipboard(httpProbe, "HTTP test")}
                                            >
                                                Copy cURL
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>

                {/* Instructions / AI Behavior */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-heading font-semibold text-foreground tracking-tight">Core Behavior</h3>
                    </div>
                    
                    <div className="minimal-card p-8 bg-primary/5 border-primary/10 space-y-6 flex flex-col h-[calc(100%-4rem)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">System Protocol</span>
                            <Button 
                                variant="outline"
                                className="h-9 rounded-lg bg-background/50 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary"
                                onClick={() => copyToClipboard(samplePrompt, "Prompt")}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                        <div className="flex-1 min-h-0 relative">
                            <div className="h-full rounded-xl bg-background/40 border border-primary/10 p-5 text-[12px] leading-relaxed font-medium text-foreground/70 italic overflow-y-auto scrollbar-hide shadow-inner">
                                {samplePrompt}
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-primary/30 italic text-center uppercase tracking-widest">Inject into agent system instructions</p>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: TOOL DIRECTORY */}
            <section className="space-y-8">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary mb-2 shadow-xl shadow-primary/5">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="text-3xl font-heading font-semibold text-foreground uppercase tracking-tighter">Capability Registry</h3>
                    <p className="text-sm font-medium text-muted-foreground/40">Registered tools available via the Debo MCP endpoint.</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[
                        { name: "get_info", desc: "Complete life documentary (Primary)", icon: Sparkles, color: "text-primary" },
                        { name: "ask_debo", desc: "Natural chat with memory context", icon: MessageSquareText, color: "text-primary" },
                        { name: "create_journal", desc: "Save new journal entries", color: "text-primary/60" },
                        { name: "update_journal", desc: "Update existing journals", color: "text-primary/60" },
                        { name: "delete_journal", desc: "Remove journal entries", color: "text-destructive/60" },
                        { name: "get_journals", desc: "List recent journals", color: "text-muted-foreground/60" },
                        { name: "search_journals", desc: "Semantic search journals", color: "text-primary" },
                        { name: "add_memory", desc: "Store persistent user facts", color: "text-primary/80" },
                        { name: "get_memories", desc: "Query stored memories", color: "text-primary/80" },
                        { name: "get_timeline", desc: "Build life timelines", color: "text-primary/40" },
                        { name: "query_graph", desc: "Analyze patterns in graph", color: "text-primary/40" },
                        { name: "import_ai_context", desc: "Import external AI exports", icon: DatabaseZap, color: "text-primary" },
                        { name: "list_chat_threads", desc: "Browse chat history", icon: MessageSquareText, color: "text-muted-foreground/60" },
                        { name: "get_chat_thread", desc: "Read specific chat threads", color: "text-muted-foreground/60" },
                    ].map(tool => {
                        const ToolIcon = ("icon" in tool ? tool.icon : Cpu) as any
                        return (
                            <div 
                                key={tool.name} 
                                className="minimal-card flex flex-col gap-4 bg-card/40 p-6 hover:bg-card/60 border border-border/50 group transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20 border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                                        <ToolIcon className={cn("h-5 w-5", tool.color)} />
                                    </div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(37,99,235,0.4)] group-hover:scale-125 transition-transform" />
                                </div>
                                <div className="space-y-1.5">
                                    <code className="text-[12px] font-bold text-foreground/80 font-mono block tracking-tight">{tool.name}</code>
                                    <p className="text-[10px] font-medium text-muted-foreground/40 leading-relaxed">{tool.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground/10 uppercase tracking-[0.4em] pt-12 justify-center">
                    <div className="h-px flex-1 bg-border/40" />
                    Registry Synchronized
                    <div className="h-px flex-1 bg-border/40" />
                </div>
            </section>
        </div>
    )
}

}
