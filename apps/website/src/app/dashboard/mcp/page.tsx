import { McpPage } from "@/components/mcp/mcp-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP",
  description: "Model Context Protocol Configuration",
};

export const dynamic = "force-dynamic";

export default function DashboardMcpPage() {
  return (
    <div className="h-full">
      <McpPage />
    </div>
  );
}

