"use client";

import { useState, useRef } from "react";
import { Send, Bot, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        setMessage("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all"
          size="icon"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-[#0a0f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f1419] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-white">Debo</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 h-80 flex items-center justify-center text-gray-500 text-sm">
            <div className="text-center space-y-2">
              <Bot className="w-8 h-8 mx-auto opacity-50" />
              <p>Direct chat is paused.</p>
              <p className="text-xs">Use MCP from any AI agent to chat with Debo.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-white/5">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Use MCP to chat with Debo..."
              disabled
              className="flex-1 bg-white/5 border-white/10 text-sm"
            />
            <Button
              type="submit"
              disabled
              size="icon"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}