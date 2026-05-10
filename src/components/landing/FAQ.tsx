"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is Debo a journal?",
    answer: "It can be, but it is more than a journal. Debo turns voice notes, diary pages, AI chats, and calendar context into memories you can search and ask about.",
  },
  {
    question: "Can Debo create reminders or calendar events?",
    answer: "Yes, Debo can draft actions from your context, but you approve them before anything is created.",
  },
  {
    question: "Is my data private?",
    answer: "Yes. Debo is designed for personal memory, so privacy, export, and deletion controls are visible and easy to access. We never sell your data or train models on it without permission.",
  },
  {
    question: "Who is Debo for?",
    answer: "People who already capture their thoughts but lose track of them: founders, students, creators, researchers, and anyone who uses voice notes, journals, or AI chats daily.",
  },
  {
    question: "Why not just use ChatGPT or Notion?",
    answer: "ChatGPT does not automatically remember your life across sources, and Notion stores notes but does not understand patterns or turn raw memories into actions automatically.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 bg-duo-polar dark:bg-slate-900/50 border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-3xl px-6">
        <h2 className="text-4xl font-heading font-black text-center text-duo-eel dark:text-white mb-16 uppercase tracking-wider">
          Frequently Asked <span className="text-duo-macaw">Questions</span>
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem 
              key={i} 
              value={`item-${i}`}
              className="bg-background dark:bg-slate-900 border-2 border-duo-swan rounded-[2rem] px-8 shadow-[0_4px_0_var(--duo-swan)]"
            >
              <AccordionTrigger className="text-left font-black text-duo-eel dark:text-white hover:no-underline py-8 text-lg uppercase tracking-tight">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-duo-wolf dark:text-slate-400 pb-8 font-bold leading-relaxed text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
