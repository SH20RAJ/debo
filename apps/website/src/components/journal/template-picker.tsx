"use client";

import {
  Sunrise,
  Users,
  Lightbulb,
  Phone,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (title: string, content: string) => void;
}

const TEMPLATES = [
  {
    icon: Sunrise,
    title: "Daily reflection",
    description: "How am I feeling? What went well? What can improve?",
    content:
      "## How I'm feeling\n\n\n\n## What went well\n\n\n\n## What could improve\n\n\n\n## Gratitude\n\n\n\n## Tomorrow's focus\n\n",
  },
  {
    icon: Users,
    title: "Meeting notes",
    description: "Attendees, agenda, decisions, and action items.",
    content:
      "## Attendees\n\n\n\n## Agenda\n\n\n\n## Discussion\n\n\n\n## Decisions\n\n\n\n## Action items\n\n- [ ] \n",
  },
  {
    icon: Lightbulb,
    title: "Startup idea",
    description: "Problem, solution, market, and next steps.",
    content:
      "## The problem\n\n\n\n## Proposed solution\n\n\n\n## Target user\n\n\n\n## Market size\n\n\n\n## Next steps\n\n",
  },
  {
    icon: Phone,
    title: "Customer call",
    description: "Call notes, pain points, and follow-ups.",
    content:
      "## Contact\n\n\n\n## Key takeaways\n\n\n\n## Pain points\n\n\n\n## Follow-ups\n\n- [ ] \n",
  },
  {
    icon: BookOpen,
    title: "Research note",
    description: "Source, key findings, and my thoughts.",
    content:
      "## Source\n\n\n\n## Key findings\n\n\n\n## My analysis\n\n\n\n## Open questions\n\n",
  },
  {
    icon: CalendarDays,
    title: "Weekly review",
    description: "Wins, blockers, lessons, and plan for next week.",
    content:
      "## Wins this week\n\n\n\n## Blockers\n\n\n\n## Lessons learned\n\n\n\n## Next week's plan\n\n",
  },
];

export function TemplatePicker({
  open,
  onOpenChange,
  onSelect,
}: TemplatePickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Pick a starting point for your journal entry.
          </DialogDescription>
        </DialogHeader>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto py-2">
          {TEMPLATES.map((template) => (
            <Card
              key={template.title}
              className="cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group"
              onClick={() => onSelect(template.title, template.content)}
            >
              <CardContent className="p-3.5 space-y-2">
                <template.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {template.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Free write option */}
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground w-full"
            onClick={() => onSelect("Untitled", "")}
          >
            Or start with a blank page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
