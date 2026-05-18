"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { saveDeboSettings, type DeboSettings, type DeboTone } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const tones: Array<{
  value: DeboTone;
  label: string;
  description: string;
}> = [
  { value: "warm", label: "Warm", description: "Friendly, steady, and human." },
  { value: "calm", label: "Calm", description: "Soft, grounded, and reflective." },
  { value: "direct", label: "Direct", description: "Clear answers with less padding." },
  { value: "coach", label: "Coach", description: "Encouraging with next steps." },
  { value: "concise", label: "Concise", description: "Short, simple, and focused." },
];

export function SettingsForm({ initialData }: { initialData: DeboSettings }) {
  const [assistantName, setAssistantName] = useState(initialData.assistantName);
  const [userDisplayName, setUserDisplayName] = useState(initialData.userDisplayName);
  const [tone, setTone] = useState<DeboTone>(initialData.tone);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveDeboSettings({
        assistantName,
        userDisplayName,
        tone,
      });

      if (result.success) {
        toast.success("Settings saved");
      } else {
        toast.error(result.error || "Settings could not be saved");
      }
    });
  };

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="assistant-name">Assistant name</Label>
            <Input
              id="assistant-name"
              value={assistantName}
              onChange={(event) => setAssistantName(event.target.value)}
              placeholder="Debo"
              className="h-11 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-name">Your name</Label>
            <Input
              id="user-name"
              value={userDisplayName}
              onChange={(event) => setUserDisplayName(event.target.value)}
              placeholder="What should Debo call you?"
              className="h-11 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>AI tone</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {tones.map((item) => {
            const selected = tone === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTone(item.value)}
                className={cn(
                  "flex min-h-28 items-start justify-between gap-4 rounded-lg border bg-card p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/20",
                )}
              >
                <span>
                  <span className="block text-base font-semibold text-foreground">{item.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {selected && <Check className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="h-11 rounded-lg px-6">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save settings
        </Button>
      </div>
    </section>
  );
}
