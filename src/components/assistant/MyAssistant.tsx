"use client";

import { Thread, ThreadList } from "@assistant-ui/react-ui";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function MyAssistant() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-all duration-300 scale-100 hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="end" 
        className="w-[400px] h-[600px] p-0 border-none bg-transparent shadow-none mb-4 overflow-hidden"
      >
        <div className="flex flex-col h-full bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
          <header className="px-4 py-3 border-b border-border/50 bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium tracking-tight">Debo Assistant</span>
            </div>
          </header>
          <div className="flex-1 overflow-hidden">
            <div className="h-full">
              <Thread 
                welcome={{
                  message: "Welcome to your personal intelligence. How can I help you today?",
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
