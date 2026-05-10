"use client";

import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";

export default function ThreadPage() {
  return (
    <div className="min-h-screen bg-[#071112] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
          <Bot className="w-10 h-10 text-emerald-400" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Chat Paused</h2>
          <p className="text-gray-400">
            Direct chat with Debo is temporarily unavailable.
            <br />
            Use MCP to connect from any AI agent.
          </p>
        </div>

        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat Home
        </Link>
      </div>
    </div>
  );
}