"use client";

import { McpPage } from "@/components/mcp/mcp-page";

export const dynamic = "force-dynamic";

export default function DashboardMcpPage() {
  return (
    <div className="h-full">
      <McpPage />
    </div>
  );
}
