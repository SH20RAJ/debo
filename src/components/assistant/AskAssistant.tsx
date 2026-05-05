"use client";

import { Thread, ThreadList } from "@assistant-ui/react-ui";
import {
  ThreadPrimitive,
  SuggestionPrimitive,
  useAssistantRuntime,
} from "@assistant-ui/react";
import { DeboToolUIs } from "./DeboToolUIs";
import { BookOpen, Brain, Search, Clock, TrendingUp, Sparkles } from "lucide-react";

const suggestions = [
  {
    icon: BookOpen,
    title: "Save a journal",
    prompt: "I want to write a new journal entry about my day",
  },
  {
    icon: Brain,
    title: "Recall memories",
    prompt: "What do you remember about me?",
  },
  {
    icon: Search,
    title: "Search journals",
    prompt: "Search my journals for entries about work",
  },
  {
    icon: Clock,
    title: "View timeline",
    prompt: "Show me my timeline from this week",
  },
  {
    icon: TrendingUp,
    title: "Find patterns",
    prompt: "What patterns do you see in my recent entries?",
  },
  {
    icon: Sparkles,
    title: "Daily check-in",
    prompt: "Let's do a daily check-in. How should I start?",
  },
];

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="mb-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        Debo Intelligence
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Your personal companion for journaling, memories, and life insights. Start a conversation or pick a suggestion below.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((s, i) => (
          <ThreadPrimitive.Suggestion
            key={i}
            prompt={s.prompt}
            autoSend
            asChild
          >
            <button className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 text-left hover:bg-muted/50 hover:border-border transition-all duration-200">
              <s.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-foreground">
                {s.title}
              </span>
            </button>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
}

export function AskAssistant() {
  const runtime = useAssistantRuntime();

  return (
    <div className="flex h-full bg-background">
      {/* Thread List Sidebar */}
      <div className="w-[280px] border-r border-border/40 flex flex-col bg-muted/20 shrink-0 overflow-hidden">
        <div className="p-4 pt-10">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 px-1">
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <ThreadList />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        <header className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-semibold tracking-tight text-foreground/80">Debo Intelligence</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest hidden sm:inline-block">
              Active Session
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="h-full max-w-3xl mx-auto flex flex-col">
            <DeboToolUIs />
            <Thread
              welcome={{
                message: <WelcomeScreen />,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
