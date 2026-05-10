import { Suspense } from "react";
import { getMcpConfig } from "@/actions/mcp";
import { McpManager } from "@/components/dashboard/mcp/mcp-manager";
import { Bot, Zap } from "lucide-react";

export default async function ChatPage() {
  const config = await getMcpConfig();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-6 pt-24 overflow-y-auto">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="relative w-max mx-auto">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
            <Bot className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Connect via MCP
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Direct chat is currently paused. Please use any MCP-compatible AI agent (like Claude Desktop or Cursor) to chat with Debo.
          </p>
        </div>

        <div className="text-left w-full mt-8 pb-12">
          <Suspense fallback={<div className="h-[400px] w-full rounded-xl bg-muted animate-pulse" />}>
            <McpManager initialKey={config?.mcpKey || ""} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
