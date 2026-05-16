"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Mic2,
  Video,
  MessageSquareText,
  Brain,
  UsersRound,
  Plug,
  Search,
  Radio,
  Terminal,
  CheckSquare,
  Calendar,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    id: "journals",
    icon: BookOpen,
    tag: "Capture",
    title: "Journals that adapt to how you think",
    description:
      "Write rich text journals, record voice notes, capture video entries, or snap photos of handwritten pages. Everything is auto-sorted, tagged, and indexed.",
    details: [
      { icon: BookOpen, label: "Text", desc: "Rich editor with AI commands" },
      { icon: Mic2, label: "Audio", desc: "Record & auto-transcribe" },
      { icon: Video, label: "Video", desc: "Record & store in Google Drive" },
      { icon: BookOpen, label: "Images", desc: "Diary pages & whiteboards" },
    ],
  },
  {
    id: "memory",
    icon: Brain,
    tag: "Intelligence",
    title: "A memory engine that extracts what matters",
    description:
      "After every journal save or chat, Debo extracts facts, entities, emotions, and topics. Your raw thoughts become structured, searchable memory.",
    details: [
      { icon: Zap, label: "Facts", desc: "Auto-extracted from every entry" },
      { icon: UsersRound, label: "Entities", desc: "People, places, dates" },
      { icon: Brain, label: "Emotions", desc: "Sentiment tracking over time" },
      { icon: Search, label: "Topics", desc: "Auto-categorized themes" },
    ],
  },
  {
    id: "chat",
    icon: MessageSquareText,
    tag: "Ask",
    title: "Chat with your entire life context",
    description:
      "Ask Debo anything. It retrieves relevant memories, cites journal sources, and gives answers backed by your own data — not generic AI guesses.",
    details: [
      { icon: Search, label: "Retrieval", desc: "Semantic search across everything" },
      { icon: BookOpen, label: "Citations", desc: "Every answer links to sources" },
      { icon: Brain, label: "Context", desc: "Memory injected into every reply" },
      { icon: Shield, label: "Private", desc: "Your data never leaves your account" },
    ],
  },
  {
    id: "characters",
    icon: UsersRound,
    tag: "People",
    title: "People profiles built from your life",
    description:
      "Debo automatically discovers people mentioned in journals, chats, and voice notes. Each person gets a profile with relationships, mentions, and context.",
    details: [
      { icon: UsersRound, label: "Auto-detect", desc: "Found across all sources" },
      { icon: BookOpen, label: "History", desc: "Every mention with excerpts" },
      { icon: Brain, label: "Relations", desc: "Relationship mapping" },
      { icon: Search, label: "Recall", desc: "Ask about anyone, anytime" },
    ],
  },
  {
    id: "connectors",
    icon: Plug,
    tag: "Integrations",
    title: "Connect unlimited apps and services",
    description:
      "Slack, Discord, Notion, Linear, Gmail, Calendar — Debo connects to your tools via Composio OAuth. Events become journals. Context builds automatically.",
    details: [
      { icon: MessageSquareText, label: "Slack & Discord", desc: "Messages become context" },
      { icon: BookOpen, label: "Notion & Linear", desc: "Docs and tasks synced" },
      { icon: Calendar, label: "Gmail & Calendar", desc: "Emails and events captured" },
      { icon: Plug, label: "Custom", desc: "Connect any API or webhook" },
    ],
  },
  {
    id: "voice",
    icon: Radio,
    tag: "Voice",
    title: "Talk to Debo like a voice assistant",
    description:
      "Real-time voice conversations powered by LiveKit. Speak naturally, Debo listens, remembers, and responds with full context from your memory graph.",
    details: [
      { icon: Mic2, label: "Listen", desc: "Deepgram speech-to-text" },
      { icon: Brain, label: "Think", desc: "NVIDIA LLM with memory" },
      { icon: Radio, label: "Speak", desc: "Cartesia natural voice" },
      { icon: Zap, label: "Realtime", desc: "Sub-second response" },
    ],
  },
  {
    id: "mcp",
    icon: Terminal,
    tag: "Developer",
    title: "MCP server for external agents",
    description:
      "Debo exposes an MCP (Model Context Protocol) server so external AI agents can access your memory. Build custom workflows on top of your personal context.",
    details: [
      { icon: Terminal, label: "Server", desc: "Expose tools to other agents" },
      { icon: Plug, label: "Client", desc: "Connect external MCP servers" },
      { icon: Zap, label: "Tools", desc: "Search, recall, write" },
      { icon: Shield, label: "Control", desc: "You decide what's shared" },
    ],
  },
  {
    id: "tasks",
    icon: CheckSquare,
    tag: "Productivity",
    title: "Tasks, calendar, and follow-ups",
    description:
      "Debo tracks promises, deadlines, and follow-ups from your conversations. Manage tasks and calendar events alongside your memories — everything connected.",
    details: [
      { icon: CheckSquare, label: "Tasks", desc: "Auto-extracted from conversations" },
      { icon: Calendar, label: "Calendar", desc: "Events linked to context" },
      { icon: Zap, label: "Follow-ups", desc: "Never drop a commitment" },
      { icon: Brain, label: "Smart", desc: "Prioritized by importance" },
    ],
  },
];

export function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const feature = FEATURES[activeFeature];

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary/70">
            Everything Debo can do
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Your personal AI, like Jarvis — but private.
          </h2>
          <p className="mx-auto max-w-lg text-base font-medium text-muted-foreground">
            Journals, voice, chat, people, tasks, calendar, and unlimited app
            integrations. All connected through one memory graph.
          </p>
        </div>

        {/* Feature tabs */}
        <div
          className={`flex flex-wrap justify-center gap-2 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {FEATURES.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActiveFeature(i)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                activeFeature === i
                  ? "bg-primary text-primary-foreground shadow-[0_2px_0_#46A302]"
                  : "border-2 border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <f.icon className="h-3 w-3" />
              {f.tag}
            </button>
          ))}
        </div>

        {/* Active feature detail */}
        <div
          key={feature.id}
          className="duo-card p-8 md:p-10 opacity-0 animate-[fadeInUp_0.4s_ease_forwards]"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left — description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10 text-primary">
                  <feature.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/70">
                  {feature.tag}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>

            {/* Right — detail cards */}
            <div className="grid grid-cols-2 gap-3">
              {feature.details.map((d, i) => (
                <div
                  key={d.label}
                  className="rounded-xl border-2 border-border/60 bg-muted/30 p-4 space-y-2 opacity-0 animate-[fadeInUp_0.3s_ease_forwards]"
                  style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground/50">
                    <d.icon className="h-3 w-3" />
                    <span className="text-[8px] font-extrabold uppercase tracking-widest">
                      {d.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom summary grid */}
        <div
          className={`grid grid-cols-2 gap-3 md:grid-cols-4 transition-all duration-700 delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <SummaryCard
            icon={BookOpen}
            label="Journal types"
            value="Text, Audio, Video, Photo"
          />
          <SummaryCard
            icon={Plug}
            label="Integrations"
            value="Slack, Notion, Gmail + more"
          />
          <SummaryCard
            icon={Brain}
            label="Memory types"
            value="Facts, entities, emotions"
          />
          <SummaryCard
            icon={Shield}
            label="Privacy"
            value="End-to-end private"
          />
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="duo-card p-4 space-y-2">
      <div className="flex items-center gap-1.5 text-primary/60">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[9px] font-extrabold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}
