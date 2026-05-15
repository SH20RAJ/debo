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
    answer: "It can be used as a journal, but the core product is memory. Debo turns voice notes, diary pages, chats, and connected context into memories you can search and ask about.",
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
    answer: "ChatGPT is conversation-first and Notion is document-first. Debo is memory-first: it connects people, dates, promises, and sources across what you capture.",
  },
];

export function FAQ() {
  return (
    <section className="py-32 bg-muted/30 border-t border-border/10">
      <div className="container mx-auto max-w-3xl px-6">
        <h2 className="text-3xl md:text-4xl font-heading font-semibold text-center text-foreground mb-20 tracking-tight">
          Frequently Asked <span className="text-primary/60">Questions</span>
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem 
              key={i} 
              value={`item-${i}`}
              className="bg-card border border-border/60 rounded-xl px-6 transition-all hover:border-primary/20"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6 text-base tracking-tight">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 font-medium leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
