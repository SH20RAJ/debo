"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { CalendarIcon, MailIcon, ClockIcon, UserIcon, BookOpenIcon, BrainCircuitIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CalendarToolUI = makeAssistantToolUI<
  Record<string, never>,
  { items?: any[] }
>({
  toolName: "getCalendarEvents",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center gap-2 p-4 animate-pulse">
          <CalendarIcon className="h-4 w-4" />
          <span>Fetching your calendar...</span>
        </div>
      );
    }

    if (!result?.items || result.items.length === 0) {
      return (
        <Card className="my-2">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar Events
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 text-sm text-muted-foreground">
            No upcoming events found.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="my-2 overflow-hidden border-primary/20">
        <CardHeader className="bg-primary/5 py-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {result.items.map((event, i) => (
              <div key={i} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="font-medium text-sm">{event.summary}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'All Day'}
                  </span>
                  {event.location && (
                    <span className="truncate max-w-[150px]">
                      @{event.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  },
});

export const EmailToolUI = makeAssistantToolUI<
  Record<string, never>,
  { messages?: any[] }
>({
  toolName: "getRecentEmails",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center gap-2 p-4 animate-pulse">
          <MailIcon className="h-4 w-4" />
          <span>Checking your inbox...</span>
        </div>
      );
    }

    if (!result?.messages || result.messages.length === 0) {
      return (
        <Card className="my-2">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              Recent Emails
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 text-sm text-muted-foreground">
            No recent emails found.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="my-2 overflow-hidden border-primary/20">
        <CardHeader className="bg-primary/5 py-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-primary" />
            Recent Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {result.messages.map((email, i) => (
              <div key={i} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-medium text-sm truncate">{email.snippet || '(No Subject)'}</div>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    ID: {email.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  },
});

export const JournalToolUI = makeAssistantToolUI<
  { query?: string; limit?: number },
  any[]
>({
  toolName: "getLatestJournals",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center gap-2 p-4 animate-pulse">
          <BookOpenIcon className="h-4 w-4" />
          <span>Retrieving your journals...</span>
        </div>
      );
    }

    if (!result || result.length === 0) {
      return (
        <div className="text-sm text-muted-foreground p-2 italic">
          No journal entries found.
        </div>
      );
    }

    return (
      <div className="grid gap-2 my-2">
        {result.map((entry, i) => (
          <Card key={i} className="border-l-4 border-l-primary/40">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
              <p className="text-sm line-clamp-3">{entry.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },
});

export const JournalSearchToolUI = makeAssistantToolUI<
  { query: string },
  any[]
>({
  toolName: "searchJournalEntries",
  render: ({ result, status, args }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center gap-2 p-4 animate-pulse">
          <BrainCircuitIcon className="h-4 w-4 text-primary" />
          <span>Searching your past memories for "{args.query}"...</span>
        </div>
      );
    }

    if (!result || result.length === 0) {
      return (
        <div className="text-sm text-muted-foreground p-2 italic">
          No relevant journal entries found for "{args.query}".
        </div>
      );
    }

    return (
      <div className="grid gap-2 my-2">
        <div className="text-xs font-semibold px-1">Top matches for "{args.query}":</div>
        {result.map((entry, i) => (
          <Card key={i} className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 text-sm">
               {entry.content}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },
});
