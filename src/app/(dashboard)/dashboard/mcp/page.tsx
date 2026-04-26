import { Network, Terminal, Copy, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MCPPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          MCP Integration
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Connect your favorite AI tools directly to your Debo journal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <CardTitle>Model Context Protocol Server</CardTitle>
            </div>
            <CardDescription>
              Debo exposes an MCP Server so external clients (like Cursor or Claude Desktop) can securely read and interact with your life telemetry and journal facts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Cursor IDE Configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Go to Cursor Settings &gt; Features &gt; MCP and add a new server using the command below. You will need your API Key from the Settings page.
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono">
                  npx -y @debo/mcp-server --api-key=&lt;YOUR_DEBO_API_KEY&gt;
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure by Default
              </h3>
              <p className="text-sm text-muted-foreground">
                All connections over MCP are read-only for external clients unless explicitly authorized. Your journal vectors and Mem0 facts remain securely encrypted in your environment.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
