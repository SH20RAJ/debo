"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles, BookOpen, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { askQuestionAction } from "@/actions/ask";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: {
    journals: any[];
    memories: any[];
  };
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await askQuestionAction(userMessage);
      
      if (result.success && result.data) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: result.data.answer,
            sources: result.data.sources
          }
        ]);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to connect to memory engine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto w-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-12 pr-4 scrollbar-none"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-medium">Ask Debo anything</h3>
              <p className="text-sm max-w-xs">"What did I learn about coding last week?" or "When was the last time I felt happy?"</p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] space-y-3 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`rounded-2xl px-5 py-4 ${
                m.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/50 border border-border/50 text-foreground"
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none font-medium leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>

              {m.sources && (m.sources.journals.length > 0 || m.sources.memories.length > 0) && (
                <div className="flex flex-wrap gap-2 px-1">
                  {m.sources.journals.map((j: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="bg-muted/30 text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 flex gap-1.5 items-center">
                      <BookOpen className="h-3 w-3" />
                      {j.title || "Entry"}
                    </Badge>
                  ))}
                  {m.sources.memories.map((mem: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="bg-muted/30 text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 flex gap-1.5 items-center">
                      <Brain className="h-3 w-3" />
                      Fact
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border/50 rounded-2xl px-6 py-4 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium italic">Consulting your past...</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-auto pt-4 border-t bg-background">
        <div className="relative flex items-center">
          <Input 
            placeholder="Ask your life..." 
            className="h-14 pl-6 pr-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button 
            size="icon" 
            className="absolute right-2 h-10 w-10 rounded-xl"
            disabled={isLoading || !input.trim()}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-center mt-3 text-muted-foreground/60 uppercase tracking-widest font-bold">
          Debo uses your journal entries and memories to answer.
        </p>
      </div>
    </div>
  );
}
