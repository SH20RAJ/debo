"use client"

import React, { useState } from "react"
import { 
    Copy, 
    RefreshCw, 
    Eye, 
    EyeOff, 
    Terminal, 
    BookOpen, 
    Cable,
    Check,
    Cpu,
    ExternalLink
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
        } catch (error) {
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

    const samplePrompt = `You are a personal AI companion with deep integration into the user's life via the Debo Intelligence Graph. 

Use the provided Debo tools to:
1. Fetch historical journals to understand context.
2. Search and store persistent memories about the user's preferences, goals, and history.
3. Interact with connected apps (GitHub, Calendar, etc.) to help the user execute tasks.

Always favor information stored in Debo over generic AI knowledge when discussing the user's personal context. When you learn something significant, proactively store it as a memory.`

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Cable className="h-5 w-5 text-primary" />
                                Connection Credentials
                            </CardTitle>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                Live
                            </Badge>
                        </div>
                        <CardDescription>
                            Use these credentials to connect external agents to your Debo instance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MCP Endpoint URL</label>
                            <div className="flex gap-2">
                                <Input value={mcpUrl} readOnly className="font-mono text-sm bg-muted/30" />
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(mcpUrl, "URL")}>
                                    {copiedField === "URL" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bearer Token (MCP Key)</label>
                            <div className="flex gap-2">
                                <Input 
                                    value={key} 
                                    type={showKey ? "text" : "password"} 
                                    readOnly 
                                    className="font-mono text-sm bg-muted/30" 
                                />
                                <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(key, "Key")}>
                                    {copiedField === "Key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/40 bg-muted/10 px-6 py-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-destructive gap-2"
                            onClick={handleRotate}
                            disabled={isRotating}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? "animate-spin" : ""}`} />
                            Rotate Key
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-primary" />
                            Sample System Prompt
                        </CardTitle>
                        <CardDescription>
                            Add this to your AI agent's instructions to enable intelligent context awareness.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative group">
                            <pre className="p-4 rounded-lg bg-muted/50 text-xs leading-relaxed whitespace-pre-wrap border border-border/40">
                                {samplePrompt}
                            </pre>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(samplePrompt, "Prompt")}
                            >
                                <Copy className="h-3 w-3 mr-2" />
                                Copy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="col-span-3 space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Setup Guides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs defaultValue="claude" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-12">
                                <TabsTrigger value="claude" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none">Claude Desktop</TabsTrigger>
                                <TabsTrigger value="cursor" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none">Cursor</TabsTrigger>
                            </TabsList>
                            <TabsContent value="claude" className="p-6 space-y-4">
                                <p className="text-sm text-muted-foreground">To add Debo to Claude Desktop, edit your config file:</p>
                                <div className="bg-muted/50 p-3 rounded text-[10px] font-mono">
                                    ~/Library/Application Support/Claude/claude_desktop_config.json
                                </div>
                                <pre className="bg-zinc-950 p-4 rounded-lg text-[10px] text-zinc-300 overflow-x-auto">
{`{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-http", "--url", "${mcpUrl}", "--token", "${key}"]
    }
  }
}`}
                                </pre>
                            </TabsContent>
                            <TabsContent value="cursor" className="p-6 space-y-4 text-sm">
                                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                                    <li>Open Cursor Settings <kbd className="text-[10px] px-1 py-0.5 rounded bg-muted border">Cmd + Shift + J</kbd></li>
                                    <li>Go to <span className="text-foreground font-medium">Features</span> &gt; <span className="text-foreground font-medium">MCP</span></li>
                                    <li>Click <span className="text-foreground font-medium">+ Add New MCP Server</span></li>
                                    <li>Set Name to <span className="text-primary font-mono italic">Debo</span></li>
                                    <li>Set Type to <span className="text-primary font-mono italic">SSE</span></li>
                                    <li>Paste the URL: <span className="text-xs break-all font-mono bg-muted px-1">{mcpUrl}</span></li>
                                </ol>
                                <p className="text-xs text-amber-500/80 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                    Note: Some versions of Cursor may require a separate auth header for Bearer tokens.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Cpu className="h-4 w-4 text-primary" />
                            Available Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "create_journal", desc: "Create new life entries" },
                            { name: "get_recent_journals", desc: "Fetch latest activity" },
                            { name: "get_journal_by_id", desc: "Fetch specific entry" },
                            { name: "search_journals", desc: "Query historical context" },
                            { name: "add_memory", desc: "Store persistent facts" },
                            { name: "search_memories", desc: "Semantic memory retrieval" },
                            { name: "get_user_info", desc: "User profile data" },
                            { name: "run_action", desc: "Call connected app APIs" },
                        ].map(tool => (
                            <div key={tool.name} className="flex flex-col gap-1">
                                <code className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit">{tool.name}</code>
                                <span className="text-[10px] text-muted-foreground px-1">{tool.desc}</span>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="link" className="text-xs h-auto p-0" asChild>
                            <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                Read MCP Specs
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
