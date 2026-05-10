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
                <div className="duo-card space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw">
                            <DatabaseZap className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-heading font-black text-duo-eel">Connection Endpoint</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-duo-wolf">MCP URL</label>
                        <div className="relative">
                            <Input 
                                value={mcpUrl} 
                                readOnly 
                                className="font-bold text-sm bg-duo-polar border-2 border-duo-swan rounded-2xl h-14 pr-14 text-duo-eel focus:border-duo-macaw outline-none transition-all" 
                            />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-2 h-10 w-10 text-duo-wolf hover:text-duo-macaw hover:bg-duo-macaw/10 rounded-xl"
                                onClick={() => copyToClipboard(mcpUrl, "URL")}
                            >
                                {copiedField === "URL" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                        <p className="text-[10px] font-bold text-duo-wolf px-1">Use this URL to connect external agents to your intelligence graph.</p>
                    </div>
                </div>

                {/* Auth Card */}
                <div className="duo-card space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-cardinal/10 border-2 border-duo-cardinal text-duo-cardinal">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-heading font-black text-duo-eel">Security</h3>
                        </div>
                        <Badge className="bg-duo-bee text-duo-eel font-black text-[10px] uppercase border-none py-1 rounded-lg">Bearer Auth</Badge>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-duo-wolf">Bearer Token</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Input 
                                    value={key} 
                                    type={showKey ? "text" : "password"} 
                                    readOnly 
                                    className="font-bold text-sm bg-duo-polar border-2 border-duo-swan rounded-2xl h-14 pr-24 text-duo-eel focus:border-duo-macaw outline-none transition-all" 
                                />
                                <div className="absolute right-2 top-2 flex gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-duo-wolf hover:text-duo-macaw hover:bg-duo-macaw/10 rounded-xl"
                                        onClick={() => setShowKey(!showKey)}
                                    >
                                        {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-duo-wolf hover:text-duo-macaw hover:bg-duo-macaw/10 rounded-xl"
                                        onClick={() => copyToClipboard(key, "Key")}
                                    >
                                        {copiedField === "Key" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                            <Button 
                                onClick={handleRotate}
                                disabled={isRotating}
                                className={cn(
                                    "btn-3d btn-3d-red h-14 w-14 rounded-2xl bg-duo-cardinal text-white p-0 shrink-0",
                                    isRotating && "opacity-50 cursor-not-allowed"
                                )}
                                title="Rotate Key"
                            >
                                <RefreshCw className={cn("h-5 w-5", isRotating && "animate-spin")} />
                            </Button>
                        </div>
                        <p className="text-[10px] font-bold text-duo-wolf px-1 italic">Rotating your key will break existing active connections.</p>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: GUIDES & PROMPT */}
            <div className="grid gap-12 lg:grid-cols-12">
                {/* Integration Guides */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-green/10 border-2 border-duo-green text-duo-green">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-heading font-black text-duo-eel">Setup Guides</h3>
                    </div>
                    
                    <div className="duo-card p-0 overflow-hidden bg-duo-snow">
                        <Tabs defaultValue="claude" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b-2 border-duo-swan bg-duo-polar h-16 px-4 gap-2">
                                {["claude", "cursor", "agents", "http"].map((tab) => (
                                    <TabsTrigger 
                                        key={tab}
                                        value={tab} 
                                        className="text-[12px] font-black uppercase tracking-widest data-[state=active]:bg-duo-snow data-[state=active]:border-2 data-[state=active]:border-duo-swan data-[state=active]:border-b-0 rounded-t-xl h-10 px-6 translate-y-3 transition-all"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <div className="p-8">
                                <TabsContent value="claude" className="mt-0 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-duo-eel">Claude Desktop</h4>
                                        <p className="text-sm font-bold text-duo-wolf italic">Add to your `claude_desktop_config.json`:</p>
                                    </div>
                                    <div className="relative group">
                                        <pre className="bg-duo-polar p-6 rounded-2xl text-[12px] text-duo-eel overflow-x-auto font-mono border-2 border-duo-swan shadow-inner">
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
                                            className="btn-3d btn-3d-white absolute top-4 right-4 h-10 bg-duo-snow text-duo-eel font-black text-[10px] uppercase rounded-xl border-2 border-duo-swan"
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
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-duo-eel">Connect to Cursor</h4>
                                        <p className="text-sm font-bold text-duo-wolf italic">Configure in Cursor Settings:</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            "Open Settings (Cmd + Shift + J)",
                                            "Features > MCP > Add New MCP Server",
                                            "Name: Debo | Type: Streamable HTTP",
                                            `URL: ${mcpUrl}`,
                                            "Header: Authorization = Bearer [Your Key]"
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-duo-polar border-2 border-duo-swan hover:border-duo-macaw transition-colors">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-duo-macaw text-white font-black text-xs shadow-[0_3px_0_#1899D6]">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-bold text-duo-eel">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="agents" className="mt-0 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-duo-eel">Custom Implementations</h4>
                                        <p className="text-sm font-bold text-duo-wolf italic">Protocol details for developers:</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            `Endpoint: ${mcpUrl}`,
                                            "Transport: Streamable HTTP / JSON-RPC 2.0",
                                            "Header: Authorization = Bearer [Your Key]",
                                            "Resource: debo://profile for behavior instructions",
                                            "Prompt: debo-homie for Debo-style orchestration"
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-duo-polar border-2 border-duo-swan">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-duo-beetle text-white font-black text-xs shadow-[0_3px_0_#B86CE6]">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-bold text-duo-eel">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="http" className="mt-0 space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-duo-eel text-center">Smoke Test</h4>
                                            <p className="text-sm font-bold text-duo-wolf text-center italic">Verify connection via cURL:</p>
                                        </div>
                                        <div className="relative group">
                                            <pre className="bg-duo-polar p-6 rounded-2xl text-[12px] text-duo-eel overflow-x-auto font-mono border-2 border-duo-swan">
{httpProbe}
                                            </pre>
                                            <Button
                                                className="btn-3d btn-3d-white absolute top-4 right-4 h-10 bg-duo-snow text-duo-eel font-black text-[10px] uppercase rounded-xl border-2 border-duo-swan"
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-fox/10 border-2 border-duo-fox text-duo-fox">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-heading font-black text-duo-eel">AI Behavior</h3>
                    </div>
                    
                    <div className="duo-card bg-duo-fox/5 border-duo-fox/30 space-y-6 flex flex-col h-[calc(100%-4rem)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-widest text-duo-fox">System Prompt</span>
                            <Button 
                                className="btn-3d btn-3d-white h-10 bg-duo-snow text-duo-fox border-2 border-duo-fox/20 font-black text-[10px] uppercase rounded-xl px-4"
                                onClick={() => copyToClipboard(samplePrompt, "Prompt")}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                        <div className="flex-1 min-h-0 relative">
                            <div className="h-full rounded-2xl bg-duo-snow border-2 border-duo-fox/20 p-5 text-[12px] leading-relaxed font-bold text-duo-eel italic overflow-y-auto scrollbar-hide shadow-inner">
                                {samplePrompt}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-duo-wolf italic text-center">Paste this into your agent's system instructions for best results.</p>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: TOOL DIRECTORY */}
            <section className="space-y-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw mb-2">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="text-3xl font-heading font-black text-duo-eel uppercase tracking-tight">Capability Registry</h3>
                    <p className="text-sm font-bold text-duo-wolf">Your agent will have access to the following tools via this MCP endpoint.</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[
                        { name: "get_info", desc: "Complete life documentary (Primary)", icon: Sparkles, color: "duo-orange" },
                        { name: "ask_debo", desc: "Natural chat with memory context", icon: MessageSquareText, color: "duo-macaw" },
                        { name: "create_journal", desc: "Save new journal entries", color: "duo-green" },
                        { name: "update_journal", desc: "Update existing journals", color: "duo-green" },
                        { name: "delete_journal", desc: "Remove journal entries", color: "duo-red" },
                        { name: "get_journals", desc: "List recent journals", color: "duo-wolf" },
                        { name: "search_journals", desc: "Semantic search journals", color: "duo-macaw" },
                        { name: "add_memory", desc: "Store persistent user facts", color: "duo-orange" },
                        { name: "get_memories", desc: "Query stored memories", color: "duo-orange" },
                        { name: "get_timeline", desc: "Build life timelines", color: "duo-beetle" },
                        { name: "query_graph", desc: "Analyze patterns in graph", color: "duo-beetle" },
                        { name: "import_ai_context", desc: "Import external AI exports", icon: DatabaseZap, color: "duo-macaw" },
                        { name: "list_chat_threads", desc: "Browse chat history", icon: MessageSquareText, color: "duo-wolf" },
                        { name: "get_chat_thread", desc: "Read specific chat threads", color: "duo-wolf" },
                    ].map(tool => {
                        const ToolIcon = ("icon" in tool ? tool.icon : Cpu) as any
                        return (
                            <div 
                                key={tool.name} 
                                className="duo-card flex flex-col gap-3 bg-duo-snow p-5 hover:bg-duo-polar group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-duo-polar border-2 border-duo-swan group-hover:border-duo-macaw group-hover:bg-duo-macaw/5 transition-colors">
                                        <ToolIcon className={cn("h-5 w-5", `text-${tool.color}`)} />
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-duo-green shadow-[0_0_8px_#58CC02] group-hover:scale-125 transition-transform" />
                                </div>
                                <div className="space-y-1">
                                    <code className="text-[13px] font-black text-duo-eel font-mono block">{tool.name}</code>
                                    <p className="text-[10px] font-bold text-duo-wolf leading-tight">{tool.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                <div className="flex items-center gap-6 text-[11px] font-black text-duo-swan uppercase tracking-[0.3em] pt-8 justify-center">
                    <div className="h-1 flex-1 bg-duo-swan/30 rounded-full" />
                    Registry Synchronized
                    <div className="h-1 flex-1 bg-duo-swan/30 rounded-full" />
                </div>
            </section>
        </div>
    )

}
