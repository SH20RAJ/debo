import { Suspense } from "react";
import { getMcpConfig } from "@/actions/mcp";
import { McpManager } from "@/components/dashboard/mcp/mcp-manager";
import { Skeleton } from "@/components/ui/skeleton";

export default async function McpPage() {
    const config = await getMcpConfig();

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Model Context Protocol</h2>
                    <p className="text-muted-foreground">
                        Connect your favorite AI agents to your Debo intelligence graph.
                    </p>
                </div>
            </div>
            
            <Suspense fallback={<McpLoading />}>
                <McpManager initialKey={config?.mcpKey || ""} />
            </Suspense>
        </div>
    );
}

function McpLoading() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 space-y-4">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div className="col-span-3 space-y-4">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
        </div>
    );
}
