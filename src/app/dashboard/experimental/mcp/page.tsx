import { MCPClient } from "@/components/dashboard/mcp/mcp-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Gateway",
  description: "Securely link your personal intelligence to external AI apps.",
};

export default function MCPPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12 space-y-8">
      <MCPClient />
    </div>
  );
}
