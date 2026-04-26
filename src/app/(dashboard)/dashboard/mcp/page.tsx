import { Network } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MCPClient } from "@/components/dashboard/mcp-client";

export default function MCPPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-4">
          Protocol Config
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          MCP Integration
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Securely bridge your Debo intelligence into Cursor, Claude Desktop, and other local environments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
      </div>
    </div>
  );
}
