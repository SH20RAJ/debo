import { Network } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MCPClient } from "@/components/dashboard/overview/mcp-client";

export default function MCPPage() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-2">
          Protocol Config
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          MCP Integration
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Securely bridge your Debo intelligence into Cursor, Claude Desktop, and other local environments.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted">
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
          <CardContent>
            <MCPClient />
          </CardContent>
        </Card>

        {/* MCP Tools List */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Exposed Tools
            </CardTitle>
            <CardDescription>
              These tools are automatically available to any connected AI client (Cursor, Claude Desktop, etc.) over the local SSE connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="bg-background border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-primary">add_mem0_fact</code>
                <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">Mutation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Allows the agent to write new facts or memories into your intelligent context via Mem0.
              </p>
            </div>
            <div className="bg-background border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-emerald-500">search_mem0_facts</code>
                <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">Query</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Allows the agent to semantically search your existing intelligence context to answer questions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
