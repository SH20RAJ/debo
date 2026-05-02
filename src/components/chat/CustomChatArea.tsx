"use client";

import { useEffect, useRef, useState } from "react";
import {
  CopilotChat as CopilotKitChat,
  Markdown,
  useChatContext,
  type AssistantMessageProps,
  type ErrorMessageProps,
  type InputProps,
  type MessagesProps,
  type RenderSuggestionsListProps,
  type UserMessageProps,
} from "@copilotkit/react-ui";
import {
  Brain,
  Check,
  Clock3,
  Copy,
  Loader2,
  Paperclip,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { JournalCard, TimelineCard, InsightCard } from "@/components/copilot/renderers";

const DEBO_CHAT_INSTRUCTIONS =
  "You are Debo's agentic companion. Search journals and memories before making claims about the user's life. Be calm, direct, and evidence-backed. Use render_journal_card for specific entries, render_timeline_item for dated periods, and render_insight_summary for patterns or signals.";

const STARTER_PROMPTS = [
  {
    title: "Find a memory",
    message: "What do you remember about my recent priorities?",
  },
  {
    title: "Trace a pattern",
    message: "What patterns have repeated in my journals lately?",
  },
  {
    title: "Review my week",
    message: "What changed for me this week?",
  },
];

export function CustomChatArea() {
  return (
    <CopilotKitChat
      className="flex h-full w-full bg-background text-foreground"
      instructions={DEBO_CHAT_INSTRUCTIONS}
      labels={{
        title: "Ask Debo",
        initial: "",
        placeholder: "Ask about memories, journals, timelines, or patterns",
        error: "Debo hit a problem while answering.",
      }}
      suggestions={STARTER_PROMPTS}
      Messages={DeboMessages}
      RenderSuggestionsList={DeboSuggestions}
      AssistantMessage={DeboAssistantMessage}
      UserMessage={DeboUserMessage}
      ErrorMessage={DeboErrorMessage}
      Input={DeboInput}
    />
  );
}

function DeboMessages({
  messages,
  inProgress,
  children,
  RenderMessage,
  AssistantMessage,
  UserMessage,
  ErrorMessage,
  ImageRenderer,
  onRegenerate,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  messageFeedback,
  markdownTagRenderers,
  chatError,
}: MessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, inProgress]);

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
        {!hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
              <Brain className="size-5" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
              Ask your life.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Search your journal, surface patterns, and turn memory into a clear next step.
            </p>
            {children}
          </div>
        ) : (
          <div className="space-y-7">
            {messages.map((message, index) => (
              <RenderMessage
                key={message.id || index}
                message={message}
                messages={messages}
                inProgress={inProgress}
                index={index}
                isCurrentMessage={index === messages.length - 1}
                AssistantMessage={AssistantMessage}
                UserMessage={UserMessage}
                ImageRenderer={ImageRenderer}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
                messageFeedback={messageFeedback}
                markdownTagRenderers={markdownTagRenderers}
              />
            ))}

            {inProgress && messages[messages.length - 1]?.role === "user" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Debo is searching your context...
              </div>
            ) : null}

            {chatError && ErrorMessage ? (
              <ErrorMessage error={chatError} isCurrentMessage />
            ) : null}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}

function DeboSuggestions({
  suggestions,
  onSuggestionClick,
  isLoading,
}: RenderSuggestionsListProps) {
  const icons = [Search, Sparkles, Clock3];

  return (
    <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
      {suggestions.map((suggestion, index) => {
        const Icon = icons[index % icons.length];

        return (
          <button
            key={suggestion.title}
            type="button"
            disabled={isLoading || suggestion.isLoading}
            onClick={() => onSuggestionClick(suggestion.message)}
            className="group flex min-h-24 flex-col rounded-lg border border-border/70 bg-card/70 p-4 text-left shadow-sm transition hover:border-primary/35 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <span className="mt-3 text-sm font-medium text-foreground">
              {suggestion.title}
            </span>
            <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {suggestion.message}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DeboInput({
  inProgress,
  onSend,
  onStop,
  onUpload,
  hideStopButton,
  chatReady,
}: InputProps) {
  const { labels } = useChatContext();
  const [text, setText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canStop = inProgress && !hideStopButton;
  const canSend = chatReady && !inProgress && text.trim().length > 0;

  const submit = async () => {
    const value = text.trim();

    if (!value || !canSend) return;

    setText("");
    await onSend(value);
    textareaRef.current?.focus();
  };

  return (
    <footer className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-card px-3 py-2 shadow-sm focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/10">
          {onUpload ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-1 size-8 text-muted-foreground"
              onClick={onUpload}
              title="Attach"
            >
              <Paperclip className="size-4" />
              <span className="sr-only">Attach</span>
            </Button>
          ) : null}

          <Textarea
            ref={textareaRef}
            value={text}
            rows={1}
            disabled={!chatReady || inProgress}
            onChange={(event) => setText(event.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !isComposing) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder={labels.placeholder}
            className="max-h-40 min-h-10 resize-none border-0 bg-transparent px-1 py-2 text-[15px] shadow-none focus-visible:border-0 focus-visible:ring-0"
          />

          <Button
            type="button"
            size="icon"
            className="mb-1 size-8 rounded-lg"
            disabled={!canSend && !canStop}
            onClick={() => {
              if (canStop) {
                onStop?.();
                return;
              }
              void submit();
            }}
            title={canStop ? "Stop" : "Send"}
          >
            {canStop ? <Square className="size-3.5" /> : <Send className="size-4" />}
            <span className="sr-only">{canStop ? "Stop" : "Send"}</span>
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] leading-5 text-muted-foreground">
          Debo can make mistakes. Verify important details against your own records.
        </p>
      </div>
    </footer>
  );
}

function DeboAssistantMessage({
  message,
  isLoading,
  isGenerating,
  onRegenerate,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  feedback,
  subComponent,
  markdownTagRenderers,
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const content = message?.content || "";
  const generativeUI = message?.generativeUI?.() ?? subComponent;
  const generativeUIPosition =
    (message as { generativeUIPosition?: "before" | "after" } | undefined)
      ?.generativeUIPosition ?? "after";

  // Fallback rendering for JSON tool calls that didn't use the tools API
  let fallbackUI: React.ReactNode = null;
  if (!generativeUI && content.trim().startsWith("{") && content.trim().endsWith("}")) {
    try {
      const data = JSON.parse(content.trim());
      const name = data.name || data.action || "";
      const args = data.args || data.arguments || data.parameters || data;

      if (name === "render_journal_card") fallbackUI = <JournalCard {...args} />;
      else if (name === "render_timeline_item") fallbackUI = <TimelineCard {...args} />;
      else if (name === "render_insight_summary") fallbackUI = <InsightCard {...args} />;
    } catch (e) {
      // Not valid JSON or parsing failed, ignore
    }
  }

  const handleCopy = async () => {
    if (!content) return;

    await navigator.clipboard?.writeText(content);
    setCopied(true);
    onCopy?.(content);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="group flex w-full gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {generativeUI && generativeUIPosition === "before" ? generativeUI : null}
        {fallbackUI && generativeUIPosition === "before" ? fallbackUI : null}

        {content && !fallbackUI ? (
          <div className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-muted">
            <Markdown
              content={content}
              components={markdownTagRenderers}
            />
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Thinking...
          </div>
        ) : null}

        {generativeUI && generativeUIPosition !== "before" ? generativeUI : null}
        {fallbackUI && generativeUIPosition !== "before" ? fallbackUI : null}

        {content && !isLoading && !isGenerating ? (

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRegenerate}
              title="Regenerate"
            >
              <RotateCcw className="size-3.5" />
              <span className="sr-only">Regenerate</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => void handleCopy()}
              title="Copy"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span className="sr-only">Copy</span>
            </Button>
            {onThumbsUp ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => message && onThumbsUp(message)}
                className={feedback === "thumbsUp" ? "text-primary" : ""}
                title="Good response"
              >
                <ThumbsUp className="size-3.5" />
                <span className="sr-only">Good response</span>
              </Button>
            ) : null}
            {onThumbsDown ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => message && onThumbsDown(message)}
                className={feedback === "thumbsDown" ? "text-primary" : ""}
                title="Bad response"
              >
                <ThumbsDown className="size-3.5" />
                <span className="sr-only">Bad response</span>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DeboUserMessage({ message, ImageRenderer }: UserMessageProps) {
  const content = message?.content;
  const textContent = getUserText(content);
  const mediaParts = getMediaParts(content);

  return (
    <div className="flex w-full justify-end animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm leading-6 text-foreground md:max-w-[72%]">
        {textContent ? <p className="whitespace-pre-wrap break-words">{textContent}</p> : null}
        {mediaParts.length > 0 ? (
          <div className={cn("space-y-2", textContent ? "mt-3" : "")}>
            {mediaParts.map((part, index) =>
              part.type === "image" ? (
                <ImageRenderer key={index} source={part.source} />
              ) : (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground"
                >
                  <Paperclip className="size-3.5" />
                  {part.type}
                </div>
              )
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DeboErrorMessage({ error, onRegenerate }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
      <div className="font-medium">{error.message}</div>
      {onRegenerate ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRegenerate}
        >
          <RotateCcw className="size-3.5" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}

type UserContent = NonNullable<UserMessageProps["message"]>["content"];

function getUserText(content: UserContent | undefined) {
  if (!content) return "";
  if (typeof content === "string") return content;

  return content
    .map((part) => (part.type === "text" ? part.text : ""))
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getMediaParts(content: UserContent | undefined) {
  if (!content || typeof content === "string") return [];

  return content.filter(
    (part) =>
      part.type === "image" ||
      part.type === "audio" ||
      part.type === "video" ||
      part.type === "document"
  ) as Array<{
    type: "image" | "audio" | "video" | "document";
    source:
      | { type: "data"; value: string; mimeType: string }
      | { type: "url"; value: string; mimeType?: string };
  }>;
}
