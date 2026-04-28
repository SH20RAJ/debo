"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ToolCallCard } from "./ToolCallCard";
import { CitationCard } from "./CitationCard";

interface ChatMessageProps {
  message: any;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-foreground rounded-tl-none border border-border"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="space-y-4">
            {/* Tool Calls */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="space-y-2 mb-4">
                {message.toolInvocations.map((toolInvocation: any) => (
                  <ToolCallCard
                    key={toolInvocation.toolCallId}
                    toolInvocation={toolInvocation}
                  />
                ))}
              </div>
            )}

            {/* AI Text Content */}
            {message.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}

            {/* Citations / Sources */}
            {message.toolInvocations && 
              message.toolInvocations.some((ti: any) => ti.state === 'result' && Array.isArray(ti.result) && ti.result.length > 0) && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Sources</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.toolInvocations
                    .filter((ti: any) => ti.state === 'result' && Array.isArray(ti.result))
                    .flatMap((ti: any) => ti.result)
                    .slice(0, 4) // Limit to 4 citations
                    .map((result: any, idx: number) => (
                      <CitationCard key={idx} source={result} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
