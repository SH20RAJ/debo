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
    ExternalLink,
    Code2,
    Shield
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
3. Detect patterns in the user's notes to provide proactive insights.

Always favor information stored in Debo over generic AI knowledge when discussing the user's personal context. When you learn something significant, proactively store it as a memory using add_memory.`

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
                                <TabsTrigger value="openai" className="text-xs data-[state=active]:bg-background">OpenAI</TabsTrigger>
                                <TabsTrigger value="langchain" className="text-xs data-[state=active]:bg-background">LangChain</TabsTrigger>
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
      "args": ["@modelcontextprotocol/server-http", "--url", "${mcpUrl}", "--token", "${key}"]
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
      "args": ["@modelcontextprotocol/server-http", "--url", "${mcpUrl}", "--token", "${key}"]
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
                                        "Name: Debo | Type: SSE",
                                        `URL: ${mcpUrl}`
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
                            <TabsContent value="openai" className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Custom GPT Action</h4>
                                    <p className="text-xs text-muted-foreground">Create a Custom GPT and add an Action with this schema:</p>
                                </div>
                                <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[11px] text-amber-500/80 mb-2">
                                    Note: You'll need to wrap the MCP endpoint in an OpenAPI spec for GPT Actions.
                                </div>
                                <Button variant="outline" size="sm" className="w-full h-9 text-xs" asChild>
                                    <a href={`${mcpUrl}/openapi.json`} target="_blank" rel="noreferrer">
                                        View OpenAPI Schema <ExternalLink className="ml-2 h-3 w-3" />
                                    </a>
                                </Button>
                            </TabsContent>
                            <TabsContent value="langchain" className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">LangChain / Python Implementation</h4>
                                    <p className="text-xs text-muted-foreground">Use the following snippet in your agent scripts:</p>
                                </div>
                                <pre className="bg-zinc-950 p-5 rounded-xl text-[11px] text-zinc-300 overflow-x-auto font-mono border border-white/5 shadow-2xl">
{`from langchain_community.tools.mcp import MCPTool
from langchain_openai import ChatOpenAI

tools = MCPTool.from_url(
    url="${mcpUrl}",
    token="${key}"
)

agent = create_react_agent(ChatOpenAI(), tools)
agent.invoke({"input": "What did I learn today?"})`}
                                </pre>
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
                                    "{samplePrompt}"
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
                                    { name: "create_journal", desc: "Save new life entries" },
                                    { name: "search_journals", desc: "Semantic history search" },
                                    { name: "add_memory", desc: "Store persistent facts" },
                                    { name: "get_memories", desc: "Recall user context" },
                                    { name: "get_timeline", desc: "Chronological timeline" },
                                    { name: "detect_patterns", desc: "AI pattern analysis" },
                                ].map(tool => (
                                    <div key={tool.name} className="p-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center justify-between mb-1">
                                            <code className="text-[10px] font-bold text-primary font-mono">{tool.name}</code>
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight">{tool.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-4">
                            <p className="text-[10px] text-muted-foreground italic text-center w-full">
                                Tools are automatically updated based on your subscription and connected apps.
                            </p>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </div>
    )
}
