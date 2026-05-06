"use client";

import { Thread } from "@assistant-ui/react-ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { DeboToolUIs } from "./DeboToolUIs";
import { usePathname } from "next/navigation";

export function MyAssistant() {
  const pathname = usePathname();

  // Don't show the floating assistant on the Ask page (it has its own full-page chat)
  if (pathname === "/dashboard/ask") return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl bg-duo-green hover:brightness-105 transition-all duration-300 btn-3d btn-3d-green z-50 animate-bounce-subtle"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[420px] h-[620px] p-0 border-none bg-transparent shadow-none mb-6 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300"
      >
        <div className="flex flex-col h-full bg-white border-2 border-duo-swan rounded-3xl overflow-hidden shadow-2xl">
          <header className="px-6 py-4 border-b-2 border-duo-swan bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-duo-green animate-pulse" />
              <span className="font-heading font-black text-duo-eel uppercase tracking-wider">
                Debo Assistant
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-hidden aui-root">
            <div className="h-full">
              <DeboToolUIs />
              <Thread
                welcome={{
                  message:
                    "Welcome to your personal intelligence. How can I help you today?",
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

