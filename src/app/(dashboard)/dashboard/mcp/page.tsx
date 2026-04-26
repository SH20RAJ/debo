"use client";

import { useState } from "react";
import { Network, Terminal, Copy, ShieldCheck, Key, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MCPPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = () => {
    setIsGenerating(true);
    // Simulate secure token generation delay
    setTimeout(() => {
      const newToken = `deb_sec_${Math.random().toString(36).substr(2, 24)}`;
      setToken(newToken);
      setIsGenerating(false);
    }, 600);
  };

  const jsonConfig = {
    mcpServers: {
      debo_journal: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sse", "http://localhost:3000/api/mcp"],
        env: {
          Authorization: token ? `Bearer ${token}` : "Bearer <YOUR_GENERATED_TOKEN>"
        }
      }
    }
  };

  const jsonString = JSON.stringify(jsonConfig, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-4">
          Protocol Config
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          MCP Integration
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Securely bridge your Debo intelligence into Cursor, Claude Desktop, and other local environments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Debo MCP Server</CardTitle>
                <CardDescription className="text-base mt-1">
                  Connect external AI clients to your life telemetry.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="rounded-xl border bg-card/50 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    Authentication Token
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate an API token to secure your MCP endpoint. This token will be injected into the configuration below.
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateToken} 
                  disabled={isGenerating}
                  className="rounded-full shadow-md hover:shadow-primary/25 transition-all duration-300"
                >
                  {isGenerating ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="mr-2 h-4 w-4" />
                  )}
                  {token ? "Regenerate Token" : "Generate Token"}
                </Button>
              </div>
              
              {token && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-medium border border-emerald-500/20 animate-in fade-in zoom-in-95 duration-300">
                  <ShieldCheck className="h-4 w-4" />
                  Token generated securely. Keep this window open while configuring your client.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Claude Desktop / Cursor Configuration
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopy}
                  className="rounded-full h-8 px-3"
                >
                  {copied ? (
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="mr-2 h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste this into your <code>claude_desktop_config.json</code> or Cursor MCP settings.
              </p>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                <pre className="bg-[#0D0D12] text-gray-300 p-5 rounded-xl text-sm overflow-x-auto font-mono border border-border/50 shadow-inner">
                  <code dangerouslySetInnerHTML={{ __html: 
                    jsonString
                      .replace(/"mcpServers":/g, '<span class="text-blue-400">"mcpServers"</span>:')
                      .replace(/"debo_journal":/g, '<span class="text-purple-400">"debo_journal"</span>:')
                      .replace(/"command":/g, '<span class="text-emerald-400">"command"</span>:')
                      .replace(/"args":/g, '<span class="text-emerald-400">"args"</span>:')
                      .replace(/"env":/g, '<span class="text-emerald-400">"env"</span>:')
                      .replace(/"Authorization":/g, '<span class="text-amber-400">"Authorization"</span>:')
                      .replace(/"npx"/g, '<span class="text-rose-300">"npx"</span>')
                      .replace(/"-y"/g, '<span class="text-rose-300">"-y"</span>')
                      .replace(/"@modelcontextprotocol\/server-sse"/g, '<span class="text-rose-300">"@modelcontextprotocol/server-sse"</span>')
                      .replace(/"http:\/\/localhost:3000\/api\/mcp"/g, '<span class="text-rose-300">"http://localhost:3000/api/mcp"</span>')
                  }} />
                </pre>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
