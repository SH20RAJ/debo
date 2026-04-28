"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { CitationCard } from "./CitationCard";
import { ToolCallCard } from "./ToolCallCard";

type MessagePart = UIMessage["parts"][number] & Record<string, any>;

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const citations = getCitations(message);

  return (
    <article
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[min(100%,48rem)]",
          isUser
            ? "rounded-lg bg-primary px-4 py-3 text-primary-foreground"
            : "space-y-4"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>
        ) : (
          <>
            <div className="space-y-2">
              {message.parts.filter(isToolPart).map((part) => (
                <ToolCallCard key={part.toolCallId || part.type} part={part} />
              ))}
            </div>

            {text && (
              <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 shadow-sm">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-7 prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                </div>
              </div>
            )}

            {citations.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <span className="h-px w-8 bg-border" />
                  Sources
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {citations.slice(0, 6).map((citation) => (
                    <CitationCard
                      key={`${citation.sourceType}:${citation.journalId || citation.id}`}
                      source={citation}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function isToolPart(part: UIMessage["parts"][number]): part is MessagePart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function getCitations(message: UIMessage) {
  const metadataCitations = citationArray(
    (message.metadata as { citations?: unknown } | undefined)?.citations
  );

  const toolCitations = message.parts
    .filter(isToolPart)
    .flatMap((part) => citationArray(part.output || part.result));

  const seen = new Set<string>();

  return [...metadataCitations, ...toolCitations].filter((citation) => {
    const key = `${citation.sourceType}:${citation.journalId || citation.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function citationArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(isCitation);
  }

  const citations = (value as { citations?: unknown } | undefined)?.citations;

  if (Array.isArray(citations)) {
    return citations.filter(isCitation);
  }

  return [];
}

function isCitation(value: unknown): value is {
  id: string;
  sourceType: "journal" | "memory";
  content: string;
  snippet?: string;
  date?: string;
  title?: string | null;
  journalId?: string;
  source?: string;
} {
  const citation = value as any;
  return (
    citation &&
    typeof citation.id === "string" &&
    (citation.sourceType === "journal" || citation.sourceType === "memory") &&
    typeof citation.content === "string"
  );
}
