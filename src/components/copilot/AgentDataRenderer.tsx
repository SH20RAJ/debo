"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText, Calendar, Clock, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function AgentDataRenderer() {
  // 1. Render Journal Card
  useCopilotAction({
    name: "render_journal_card",
    description: "Render a journal entry card in the chat.",
    available: "frontend",
    parameters: [
      { name: "id", type: "string", description: "The ID of the journal entry.", required: true },
      { name: "title", type: "string", description: "The title of the journal entry.", required: true },
      { name: "content", type: "string", description: "The content snippet of the journal entry.", required: true },
      { name: "date", type: "string", description: "The date of the journal entry.", required: true },
    ],
    render: (props: any) => {
      const { id, title, content, date } = props.args;
      const formattedDate = new Date(date).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      });

      return (
        <Card className="my-2 border-primary/20 bg-card/40 backdrop-blur-md transition-all hover:border-primary/40 shadow-sm overflow-hidden group">
          <div className="absolute left-0 top-0 h-full w-1 bg-primary/30 group-hover:bg-primary transition-colors" />
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <BookOpenText className="size-4 text-primary" />
              {title || "Untitled Entry"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="line-clamp-3 text-xs text-muted-foreground mb-3 leading-relaxed">
              {content}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                <Calendar className="size-3" />
                {formattedDate}
              </div>
              <Link 
                href={`/dashboard/journal/${id}`}
                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
              >
                Open
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    },
  });

  // 2. Render Timeline Card
  useCopilotAction({
    name: "render_timeline_item",
    description: "Render a specific timeline entry in the chat.",
    available: "frontend",
    parameters: [
      { name: "date", type: "string", description: "The date of the timeline entry.", required: true },
      { name: "summary", type: "string", description: "A summary of the day/period.", required: true },
      { name: "events", type: "string[]", description: "Key events during this period.", required: true },
      { name: "emotions", type: "string[]", description: "Dominant emotions.", required: false },
    ],
    render: (props: any) => {
      const { date, summary, events, emotions = [] } = props.args;
      return (
        <Card className="my-2 border-amber-500/20 bg-amber-500/5 backdrop-blur-md shadow-sm overflow-hidden group">
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-500/30" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
               <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight">
                <Clock className="size-4 text-amber-600" />
                Timeline Node
              </CardTitle>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{date}</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <p className="text-xs font-medium leading-relaxed">{summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {(events || []).slice(0, 3).map((e: string) => (
                <Badge key={e} variant="outline" className="text-[9px] px-2 py-0 border-amber-500/20 bg-white/50 dark:bg-black/20">
                  {e}
                </Badge>
              ))}
              {(emotions || []).slice(0, 2).map((e: string) => (
                <Badge key={e} variant="outline" className="text-[9px] px-2 py-0 border-primary/20 bg-primary/5 text-primary">
                  {e}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    },
  });

  // 3. Render Insight Card
  useCopilotAction({
    name: "render_insight_summary",
    description: "Render a deep life insight in the chat.",
    available: "frontend",
    parameters: [
      { name: "insight", type: "string", description: "The insight text.", required: true },
      { name: "type", type: "string", description: "Type of insight (e.g., emotion, topic, pattern).", required: false },
    ],
    render: (props: any) => {
      const { insight, type = "Intelligence" } = props.args;
      return (
        <Card className="my-2 border-primary/30 bg-primary/5 backdrop-blur-xl shadow-md overflow-hidden animate-in fade-in zoom-in duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          <CardContent className="p-5 relative z-10 space-y-3">
            <div className="flex items-center gap-2">
               <div className="flex size-6 items-center justify-center rounded-lg bg-primary/20 text-primary">
                 <Sparkles className="size-3.5" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">{type} Signal</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed tracking-tight text-foreground/90">
              {insight}
            </p>
          </CardContent>
        </Card>
      );
    },
  });

  return null;
}
