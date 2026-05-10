import { Suspense } from "react";
import { getMcpConfig } from "@/actions/mcp";
import { McpManager } from "@/components/dashboard/mcp/mcp-manager";
import { Skeleton } from "@/components/ui/skeleton";

export default async function McpPage() {
    const config = await getMcpConfig();

    return (
        <div className="flex-1 bg-duo-snow">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:px-8">
                <header className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-duo-swan bg-duo-polar px-4 py-2 text-[11px] font-black uppercase tracking-widest text-duo-wolf">
                        <Cable className="h-4 w-4 text-duo-macaw" />
                        Infrastructure
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-5xl font-heading font-black tracking-tight text-duo-eel md:text-6xl">
                            Model Context <span className="text-duo-macaw">Protocol</span>
                        </h1>
                        <p className="max-w-2xl text-xl font-bold leading-relaxed text-duo-wolf">
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
        <div className="flex flex-col gap-12">
            {/* Top Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-[200px] w-full rounded-2xl border-2 border-duo-swan" />
                <Skeleton className="h-[200px] w-full rounded-2xl border-2 border-duo-swan" />
            </div>

            {/* Middle Grid */}
            <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-6">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-[500px] w-full rounded-2xl border-2 border-duo-swan" />
                </div>
                <div className="lg:col-span-5 space-y-6">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-[500px] w-full rounded-2xl border-2 border-duo-swan" />
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-10 w-64 rounded-xl" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl border-2 border-duo-swan" />
                    ))}
                </div>
            </div>
        </div>
    );
}
