import { Suspense } from "react";
import { getMcpConfig } from "@/actions/mcp";
import { McpManager } from "@/components/dashboard/mcp/mcp-manager";
import { Skeleton } from "@/components/ui/skeleton";

export default async function McpPage() {
    const config = await getMcpConfig();

    return (
        <div className="flex-1 bg-background">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-8">
                <header className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Cable className="h-3 w-3" />
                        Infrastructure
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                            Model Context <span className="text-muted-foreground/40">Protocol.</span>
                        </h1>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                            Connect your favorite AI agents directly to your Debo intelligence graph.
                        </p>
                    </div>
                </header>
                
                <Suspense fallback={<McpLoading />}>
                    <McpManager initialKey={config?.mcpKey || ""} />
                </Suspense>
            </div>
        </div>
    );
}

import { Cable } from "lucide-react";

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
