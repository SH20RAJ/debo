"use client";

import { useState } from "react";
import { Terminal, Cpu, Copy, Check, Sparkles, BookOpen } from "lucide-react";

export function McpCliSection() {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [activeTab, setActiveTab] = useState<"cli" | "mcp">("cli");

  const installCommand = "npm install -g @debo.life/cli";
  const mcpConfig = `{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://app.debo.life/api/mcp",
        "-h",
        "x-stack-access-token:YOUR_TOKEN"
      ]
    }
  }
}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="dev-integrations" className="py-24 md:py-32 px-6 border-t border-landing-border-light bg-[#080c07] relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-[1120px] relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-landing-border bg-landing-surface text-landing-xs font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Developer Protocol
          </div>
          <h2 className="font-heading text-landing-3xl md:text-landing-4xl font-extrabold tracking-tight text-white">
            Own your memory.
            <span className="text-landing-text-secondary block md:inline"> Power your AI.</span>
          </h2>
          <p className="text-landing-base md:text-landing-lg text-landing-text-secondary max-w-2xl mx-auto leading-relaxed">
            Debo integrates natively with your workflow. Expose your memory graph locally or remotely via MCP, or manage it through our terminal CLI.
          </p>
        </div>

        {/* Desktop Layout: Side-by-Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* CLI Card */}
          <div className="flex flex-col rounded-2xl border border-landing-border-light bg-landing-surface p-6 md:p-8 space-y-6 hover:border-emerald-500/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-landing-xl font-bold text-white">Debo CLI</h3>
                <p className="text-xs text-landing-text-tertiary">Control your memory from the terminal</p>
              </div>
            </div>

            <p className="text-landing-sm text-landing-text-secondary leading-relaxed">
              Query vector nodes, save manual journals, search memories semantically, and fetch status of synched integrations. Install rule sets into your local IDE workspace in one command.
            </p>

            <div className="space-y-4 flex-1 flex flex-col justify-end">
              {/* Command box */}
              <div className="flex items-center justify-between bg-black/40 border border-landing-border-light rounded-xl px-4 py-3 font-mono text-xs text-emerald-400">
                <code className="select-all">{installCommand}</code>
                <button
                  onClick={() => copyToClipboard(installCommand, setCopiedCmd)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-landing-text-tertiary hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Commands usage visualizer */}
              <div className="bg-black/50 rounded-xl p-4 font-mono text-[11px] text-landing-text-secondary border border-landing-border-light/40 space-y-2.5">
                <div>
                  <span className="text-emerald-500/60">$</span> debo login <span className="text-landing-text-tertiary">&lt;userId&gt;</span>
                  <div className="text-[10px] text-landing-text-tertiary/60 pl-4">✔ Authenticated & installed developer rules (.cursorrules)</div>
                </div>
                <div>
                  <span className="text-emerald-500/60">$</span> debo search <span className="text-emerald-400">"Apify connector ideas"</span>
                  <div className="text-[10px] text-emerald-400/80 pl-4">&gt; Found 1 result in [JOURNAL]: "Discussed migrating Apify workers..."</div>
                </div>
                <div>
                  <span className="text-emerald-500/60">$</span> debo journal create <span className="text-landing-text-tertiary">-t "Idea" -c "..."</span>
                  <div className="text-[10px] text-landing-text-tertiary/60 pl-4">✔ Chunked & uploaded successfully.</div>
                </div>
              </div>
            </div>
          </div>

          {/* MCP Card */}
          <div className="flex flex-col rounded-2xl border border-landing-border-light bg-landing-surface p-6 md:p-8 space-y-6 hover:border-emerald-500/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-landing-xl font-bold text-white">Model Context Protocol</h3>
                <p className="text-xs text-landing-text-tertiary">Give your AI models context on your past</p>
              </div>
            </div>

            <p className="text-landing-sm text-landing-text-secondary leading-relaxed">
              Expose your search and query capabilities directly to editors. Cursor, Claude Desktop, and Cline can request memory data over remote HTTP using the secure MCP wrapper.
            </p>

            <div className="space-y-4 flex-1 flex flex-col justify-end">
              {/* Configuration block */}
              <div className="relative rounded-xl border border-landing-border-light bg-black/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-landing-border-light bg-black/20 text-[10px] text-landing-text-tertiary">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-500/60">claude_desktop_config.json</span>
                  <button
                    onClick={() => copyToClipboard(mcpConfig, setCopiedMcp)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedMcp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-[10px] text-landing-text-secondary overflow-x-auto whitespace-pre leading-relaxed max-h-40 scrollbar-none">
                  {mcpConfig}
                </pre>
              </div>
            </div>
          </div>

        </div>

        {/* Unified Rule File CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-emerald-500/10 bg-gradient-to-r from-emerald-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-landing-base font-bold text-white flex items-center gap-2">
                Unified AI Skill Rule File
              </h4>
              <p className="text-landing-sm text-landing-text-secondary leading-relaxed">
                We consolidate all model context guidelines into a single file (<code className="text-emerald-400 font-mono">debo-skill.md</code>). Get it instantly during CLI setup or download it to teach your AI how to read your past.
              </p>
            </div>
          </div>
          <a
            href="/debo-skill.md"
            target="_blank"
            className="inline-flex items-center gap-2 bg-emerald-500 text-white rounded-xl px-5 py-2.5 text-landing-sm font-semibold hover:bg-emerald-600 transition-colors shadow-[0_2px_0_#388E02] cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Read Rule File
          </a>
        </div>

      </div>
    </section>
  );
}
