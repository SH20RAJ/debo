"use client";

import {
  X,
  Sunrise,
  Users,
  Lightbulb,
  Phone,
  BookOpen,
  CalendarDays,
} from "lucide-react";

interface TemplatePickerProps {
  onSelect: (title: string, content: string) => void;
  onClose: () => void;
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

export function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Choose a template</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template grid */}
        <div className="p-4 grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto">
          {TEMPLATES.map((template) => (
            <button
              key={template.title}
              onClick={() => onSelect(template.title, template.content)}
              className="flex flex-col items-start p-3.5 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
            >
              <template.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {template.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                {template.description}
              </p>
            </button>
          ))}
        </div>

        {/* Free write option */}
        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={() => onSelect("Untitled", "")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Or start with a blank page
          </button>
        </div>
      </div>
    </div>
  );
}
