"use client";

import { Check, X, Minus } from "lucide-react";

const rows = [
  { label: "Remembers across time", notes: true, chatbot: false, debo: true },
  { label: "Understands voice/journal/images", notes: false, chatbot: "partial", debo: true },
  { label: "Finds patterns automatically", notes: false, chatbot: false, debo: true },
  { label: "Creates reminders/actions", notes: "partial", chatbot: false, debo: true },
  { label: "Shows evidence/sources", notes: true, chatbot: false, debo: true },
  { label: "Private & exportable", notes: true, chatbot: false, debo: true },
];

export function Differentiation() {
  return (
    <section className="py-24 bg-duo-polar border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-duo-eel">
            Not another <span className="text-duo-macaw">notes app.</span>
          </h2>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border-4 border-duo-swan bg-background shadow-[0_12px_0_var(--duo-swan)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-duo-swan">
                <th className="p-8 text-xs font-black uppercase tracking-widest text-duo-hare">Feature</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-duo-eel text-center">Notes App</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-duo-eel text-center">Chatbot</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-duo-feather text-center bg-duo-feather/5">Debo</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-duo-swan">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-duo-polar transition-colors">
                  <td className="p-8 text-base font-black text-duo-eel uppercase tracking-tight">{row.label}</td>
                  <td className="p-8 text-center">
                    <StatusIcon status={row.notes} />
                  </td>
                  <td className="p-8 text-center">
                    <StatusIcon status={row.chatbot} />
                  </td>
                  <td className="p-8 text-center bg-duo-feather/5">
                    <StatusIcon status={row.debo} isPrimary />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StatusIcon({ status, isPrimary = false }: { status: boolean | string; isPrimary?: boolean }) {
  if (status === true) {
    return <Check className={`w-8 h-8 mx-auto ${isPrimary ? "text-duo-feather" : "text-duo-macaw"}`} />;
  }
  if (status === "partial") {
    return <Minus className="w-8 h-8 mx-auto text-duo-fox" />;
  }
  return <X className="w-8 h-8 mx-auto text-duo-swan" />;
}


