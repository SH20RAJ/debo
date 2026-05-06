"use client";

import { Thread, ThreadList } from "@assistant-ui/react-ui";
import {
  ThreadPrimitive,
  SuggestionPrimitive,
  useAssistantRuntime,
} from "@assistant-ui/react";
import Image from "next/image";
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
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-6 relative w-32 h-32 animate-float">
        <Image 
          src="/mascot.png" 
          alt="Debo Mascot" 
          fill 
          className="object-contain"
        />
      </div>
      <h1 className="text-4xl font-heading font-black tracking-tight text-duo-eel mb-2">
        Debo Intelligence
      </h1>
      <p className="text-lg font-bold text-duo-wolf mb-10 max-w-sm">
        Your personal companion for journaling, memories, and life insights.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full">
        {suggestions.map((s, i) => (
          <ThreadPrimitive.Suggestion
            key={i}
            prompt={s.prompt}
            autoSend
            asChild
          >
            <button className="duo-card hover-bounce group flex items-center gap-4 text-left p-5">
              <div className="p-2 rounded-xl bg-duo-polar border-2 border-duo-swan group-hover:border-duo-macaw transition-colors">
                <s.icon className="h-6 w-6 text-duo-blue" />
              </div>
              <span className="text-base font-black text-duo-eel uppercase tracking-wider">
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
      <div className="w-[300px] border-r-2 border-duo-swan flex flex-col bg-background shrink-0 overflow-hidden">
        <div className="p-6 pt-12">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-duo-swan mb-4 px-2">
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <ThreadList />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        <header className="h-20 border-b-2 border-duo-swan flex items-center justify-between px-8 bg-background z-10">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-duo-green animate-pulse" />
            <h1 className="font-heading font-black text-xl tracking-tight text-duo-eel uppercase tracking-wider">Debo Intelligence</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-duo-swan uppercase tracking-[0.2em] hidden sm:inline-block">
              Active Session
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="h-full max-w-4xl mx-auto flex flex-col p-6">
            <DeboToolUIs />
            <Thread
              welcome={{
                message: <WelcomeScreen /> as any,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

