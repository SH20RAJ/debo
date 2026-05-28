"use client";

import { useState, useCallback, useRef } from "react";
import { ChatArea, type Message } from "./chat-area";
import { Composer } from "./composer";
import { SourceRail, type RelatedMemory } from "./source-rail";
import { type SourceData } from "./source-citation";
import { api } from "@/lib/api";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  SSE helpers                                                        */
/* ------------------------------------------------------------------ */

interface AskEvent {
  type: string;
  [key: string]: unknown;
}

/** Robustly parse SSE events from a text chunk, handling partial lines. */
function createSSEParser() {
  let buffer = "";

  return function parse(chunk: string): AskEvent[] {
    buffer += chunk;
    const events: AskEvent[] = [];
    const parts = buffer.split("\n\n");

    // Keep the last part as it may be incomplete
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      for (const line of part.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            events.push(JSON.parse(line.slice(6)));
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
    return events;
  };
}

/* ------------------------------------------------------------------ */
/*  Map API source data -> UI SourceData                                */
/* ------------------------------------------------------------------ */

function mapSource(raw: Record<string, unknown>): SourceData {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    type: (raw.type as SourceData["type"]) ?? "file",
    label: String(raw.label ?? raw.title ?? "Source"),
    detail: String(raw.detail ?? raw.meta ?? ""),
    confidence: (raw.confidence as SourceData["confidence"]) ?? "partial",
    excerpt: raw.excerpt ? String(raw.excerpt) : undefined,
    timestamp: raw.timestamp ? String(raw.timestamp) : undefined,
    people: raw.people as string[] | undefined,
    relatedTasks: raw.relatedTasks as string[] | undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSources, setActiveSources] = useState<SourceData[]>([]);
  const [relatedMemories, setRelatedMemories] = useState<RelatedMemory[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Send handler with SSE streaming                                  */
  /* ---------------------------------------------------------------- */

  const handleSend = useCallback(async (text: string, mode?: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    // Create an empty assistant message we'll stream tokens into
    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsResponding(true);

    // Reset rail data for the new query
    setActiveSources([]);
    setRelatedMemories([]);
    setFollowUps([]);

    // Accumulators for streaming
    let answer = "";
    const sources: SourceData[] = [];
    const related: RelatedMemory[] = [];
    const followupQuestions: string[] = [];

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const response = await api.ask.stream({ question: text, mode });

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
            case "retrieval_started": {
              // Show retrieval loading indicator in the assistant message
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: "", retrievalActive: true }
                    : m
                )
              );
              break;
            }

            case "source_found": {
              const src = mapSource(event as Record<string, unknown>);
              sources.push(src);
              setActiveSources([...sources]);
              break;
            }

            case "answer_delta": {
              const token = String(event.token ?? event.delta ?? event.text ?? "");
              answer += token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: answer, retrievalActive: false }
                    : m
                )
              );
              break;
            }

            case "citation_added": {
              const citation = mapSource(event as Record<string, unknown>);
              // Merge into sources if not already there
              if (!sources.find((s) => s.id === citation.id)) {
                sources.push(citation);
                setActiveSources([...sources]);
              }
              break;
            }

            case "related_memory": {
              related.push({
                id: String(event.id ?? crypto.randomUUID()),
                type: (event.sourceType as SourceData["type"]) ?? "file",
                title: String(event.title ?? ""),
                meta: String(event.meta ?? ""),
              });
              setRelatedMemories([...related]);
              break;
            }

            case "suggested_followup": {
              const q = String(event.question ?? event.text ?? "");
              if (q) followupQuestions.push(q);
              setFollowUps([...followupQuestions]);
              break;
            }

            case "done": {
              // Extract any final metadata the server sends
              if (event.sources) {
                const finalSources = (event.sources as Record<string, unknown>[]).map(mapSource);
                setActiveSources(finalSources);
              }
              if (event.followUps || event.follow_ups) {
                const ups = (event.followUps ?? event.follow_ups) as string[];
                setFollowUps(ups);
              }
              if (event.related) {
                setRelatedMemories(event.related as RelatedMemory[]);
              }
              break;
            }

            case "error": {
              throw new Error(String(event.message ?? "Stream error"));
            }
          }
        }
      }
    } catch (err: unknown) {
      if (abort.signal.aborted) return;

      const msg = err instanceof Error ? err.message : "Something went wrong";
      console.error("Ask stream error:", err);
      toast.error(msg);

      // If we got no answer content, replace with an error message
      if (!answer) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I had trouble connecting to your memory. Please try again.",
                  retrievalActive: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsResponding(false);
      abortRef.current = null;
    }
  }, []);

  const handlePromptClick = useCallback(
    (prompt: string) => {
      handleSend(prompt, "Recall");
    },
    [handleSend]
  );

  const handleFollowUpClick = useCallback(
    (question: string) => {
      handleSend(question, "Recall");
    },
    [handleSend]
  );

  return (
    <div className="flex h-full">
      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea messages={messages} isResponding={isResponding} onPromptClick={handlePromptClick} />
        <Composer onSend={handleSend} isResponding={isResponding} />
      </div>

      {/* Right source rail */}
      <SourceRail
        sources={activeSources}
        related={relatedMemories}
        followUps={followUps}
        onFollowUpClick={handleFollowUpClick}
      />
    </div>
  );
}
