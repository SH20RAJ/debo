import { Mic2, BookOpen, Lock } from "lucide-react";

const promises = [
  {
    icon: Mic2,
    title: "Capture anything",
    text: "Save voice notes, journals, chats, meeting notes, and personal context without changing your habits.",
  },
  {
    icon: BookOpen,
    title: "Remember with evidence",
    text: "Ask Debo what happened, who said what, and what needs follow-up — with source references attached.",
  },
  {
    icon: Lock,
    title: "Stay in control",
    text: "Your memories stay private, exportable, and deleteable. Debo never acts without your approval.",
  },
];

export function ProductPromises() {
  return (
    <section className="py-20 px-6 bg-muted/30 dark:bg-muted/20">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {promises.map((p) => (
            <div key={p.title} className="duo-card p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                {p.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
