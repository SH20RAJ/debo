"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  UserRound,
  Sparkles,
  Settings,
  Brain,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  BadgeAlert,
  Save,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SourceData {
  id: string;
  type: string;
  title: string;
  snippet?: string;
  createdAt?: string;
}

// SSE helper matching AskPage
interface AskEvent {
  type: string;
  [key: string]: unknown;
}

function createSSEParser() {
  let buffer = "";
  return function parse(chunk: string): AskEvent[] {
    buffer += chunk;
    const events: AskEvent[] = [];
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      for (const line of part.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            events.push(JSON.parse(line.slice(6)));
          } catch {
            // skip malformed
          }
        }
      }
    }
    return events;
  };
}

export function TwinPage() {
  // Config states
  const [tone, setTone] = useState("professional");
  const [customRules, setCustomRules] = useState(
    "1. Keep responses clear and structured.\n2. Do not use exclamation marks or marketing jargon.\n3. Base facts strictly on provided documents."
  );
  const [selectedSeeds, setSelectedSeeds] = useState<string[]>([]);
  
  // Sources data for training seed checklist
  const [sources, setSources] = useState<SourceData[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  // Chat simulator states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your Digital Twin. Once you configure my tone and select seed documents, you can chat with me here to check if I replicate your writing style and factual context accurately.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [activeSources, setActiveSources] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load tone config from localStorage + load sources from API
  useEffect(() => {
    const savedTone = localStorage.getItem("debo-twin-tone");
    const savedRules = localStorage.getItem("debo-twin-rules");
    const savedSeeds = localStorage.getItem("debo-twin-seeds");

    if (savedTone) setTone(savedTone);
    if (savedRules) setCustomRules(savedRules);
    if (savedSeeds) {
      try {
        setSelectedSeeds(JSON.parse(savedSeeds));
      } catch {
        // ignore
      }
    }

    async function loadSources() {
      try {
        const data = await api.sources.list();
        setSources(data || []);
      } catch (err) {
        console.error("Failed to load sources for digital twin:", err);
      } finally {
        setLoadingSources(false);
      }
    }
    loadSources();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save config handler
  const handleSaveConfig = () => {
    localStorage.setItem("debo-twin-tone", tone);
    localStorage.setItem("debo-twin-rules", customRules);
    localStorage.setItem("debo-twin-seeds", JSON.stringify(selectedSeeds));
    toast.success("Digital Twin persona parameters updated!");
  };

  // Toggle seed document selection
  const handleToggleSeed = (id: string) => {
    setSelectedSeeds((prev) =>
      prev.includes(id) ? prev.filter((seedId) => seedId !== id) : [...prev, id]
    );
  };

  // Ask Twin handler
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isResponding) return;

    const userText = inputVal;
    setInputVal("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
    };

    const assistantId = `twin-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsResponding(true);
    setActiveSources([]);

    // We build the persona prompt using current configs
    const personaInstruction = `[Digital Twin Mode: Tone=${tone}. Rules: ${customRules.replace(/\n/g, " ")}]`;
    const fullQuestion = `${personaInstruction} Answer user question: ${userText}`;

    let answerText = "";
    const loadedSources: any[] = [];

    try {
      // Use standard recall ask streaming, passing the twin mode instructions
      const response = await api.ask.stream({
        question: fullQuestion,
        mode: "draft",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      const parse = createSSEParser();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const events = parse(decoder.decode(value, { stream: true }));
        for (const event of events) {
          switch (event.type) {
            case "source_found": {
              const src = event as any;
              loadedSources.push(src);
              setActiveSources([...loadedSources]);
              break;
            }
            case "answer_delta": {
              const delta = String(event.token ?? event.delta ?? event.text ?? "");
              answerText += delta;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: answerText } : m))
              );
              break;
            }
            case "done": {
              if (event.sources) {
                setActiveSources(event.sources as any[]);
              }
              break;
            }
            case "error": {
              throw new Error(String(event.message ?? "Stream error"));
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Twin pipeline error:", err);
      toast.error(err.message || "Failed to reach your Twin pipeline");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Oops, I encountered a synapse error while answering." }
            : m
        )
      );
    } finally {
      setIsResponding(false);
    }
  };

  const seedSourcesFiltered = useMemo(() => {
    return sources.filter((s) => s.type === "journal" || s.type === "voice");
  }, [sources]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#090d08] via-[#0b100a] to-[#080b07] relative overflow-hidden select-none">
      {/* Visual background lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#58CC02]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#58CC02]/[0.03] blur-[100px] pointer-events-none" />

      {/* Main Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border/20 z-10 shrink-0 bg-zinc-950/25 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 font-[var(--font-nunito)]">
            <UserRound className="w-5 h-5 text-primary" />
            Digital Twin
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your writing style, tone parameters, and train the agent on specific core memories.
          </p>
        </div>
      </div>

      {/* Dual Panel Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: Settings */}
        <div className="w-full lg:w-96 border-r border-border/20 bg-zinc-950/10 backdrop-blur-md flex flex-col min-h-0 shrink-0 select-text">
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-6">
              
              {/* Persona Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Settings className="w-3.5 h-3.5 text-primary" />
                  Twin Persona Settings
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="tone-select" className="text-xs text-muted-foreground font-semibold">Tone of Voice</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone-select" className="h-9 text-xs bg-zinc-900/40 border-border/40 focus:ring-primary rounded-xl">
                      <SelectValue placeholder="Select Tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-border/40 text-xs rounded-xl">
                      <SelectItem value="professional">Professional (Structured, formal)</SelectItem>
                      <SelectItem value="casual">Casual (Friendly, conversational)</SelectItem>
                      <SelectItem value="concise">Concise (Direct, bullet points)</SelectItem>
                      <SelectItem value="analytical">Analytical (Logical, fact-heavy)</SelectItem>
                      <SelectItem value="playful">Playful (Enthusiastic, relaxed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rules-area" className="text-xs text-muted-foreground font-semibold">Custom Style Rules</label>
                  <Textarea
                    id="rules-area"
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    placeholder="Enter custom writing instructions..."
                    rows={4}
                    className="text-xs bg-zinc-900/40 border-border/40 focus-visible:ring-primary rounded-xl"
                  />
                </div>
              </div>

              <Separator className="bg-border/25" />

              {/* Training Seed Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                    Seed Memories
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {selectedSeeds.length} Selected
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select which journals or transcripts should seed the twin's reference database for style calibration.
                </p>

                <div className="space-y-2 p-2 bg-zinc-900/20 border border-border/10 rounded-2xl max-h-60 overflow-y-auto">
                  {loadingSources ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground text-[10px] gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      Loading journals...
                    </div>
                  ) : seedSourcesFiltered.length > 0 ? (
                    seedSourcesFiltered.map((src) => {
                      const isChecked = selectedSeeds.includes(src.id);
                      return (
                        <div
                          key={src.id}
                          onClick={() => handleToggleSeed(src.id)}
                          className={cn(
                            "flex items-start gap-2.5 p-2 rounded-xl border border-transparent cursor-pointer transition select-none",
                            isChecked ? "bg-zinc-800/40 border-border/20" : "hover:bg-zinc-900/30"
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleSeed(src.id)}
                            className="mt-0.5 border-border/60 data-[state=checked]:bg-primary rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">
                              {src.title || "Untitled Source"}
                            </p>
                            <span className="text-[9px] text-muted-foreground capitalize">
                              {src.type}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-[10px]">
                      No journal notes available.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Save */}
              <Button
                onClick={handleSaveConfig}
                className="w-full h-9 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Persona Configuration
              </Button>

            </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Chat Simulator */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950/5 relative">
          
          {/* Active Citations Sub-bar */}
          {activeSources.length > 0 && (
            <div className="px-6 py-2 bg-[#58CC02]/5 border-b border-border/20 text-[10px] text-foreground flex items-center justify-between z-10 shrink-0">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#58CC02]" />
                Synapse citations loaded ({activeSources.length})
              </span>
              <div className="flex gap-1.5 overflow-x-auto max-w-[70%]">
                {activeSources.slice(0, 3).map((src) => (
                  <Badge key={src.id} variant="outline" className="border-border/30 bg-card/25 text-[8px] text-muted-foreground rounded-md max-w-[120px] truncate">
                    {src.title || "Citation"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Chat Logs */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col space-y-1.5 p-4 rounded-3xl max-w-[85%] text-xs leading-relaxed border select-text",
                    m.role === "user"
                      ? "bg-zinc-800/40 border-border/10 text-foreground ml-auto rounded-tr-none"
                      : "bg-[#121610]/40 border-[#1F261B] text-foreground mr-auto rounded-tl-none"
                  )}
                >
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                    {m.role === "user" ? "You" : "Twin (Simulated)"}
                  </span>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              {isResponding && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs p-4 bg-zinc-900/10 border border-border/5 rounded-3xl max-w-[150px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Twin thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Composer Input */}
          <div className="p-4 border-t border-border/20 z-10 shrink-0 bg-zinc-950/20 backdrop-blur-md">
            <form onSubmit={handleSend} className="max-w-2xl mx-auto flex items-center gap-2.5">
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask your Twin a question to test its logic..."
                disabled={isResponding}
                className="flex-1 h-10 text-xs bg-zinc-900/40 border-border/40 focus-visible:ring-primary rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isResponding || !inputVal.trim()}
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
