import React from "react";
import { EditorRoot, EditorContent, handleCommandNavigation } from "novel";
import { defaultExtensions } from "./extensions";
import { slashCommand, suggestionItems, renderItems } from "./slash-command";

const extensions = [...defaultExtensions, slashCommand.configure({
  suggestion: {
    items: ({ query }: { query: string }) => {
      return suggestionItems.filter((item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase()) ||
        item.searchTerms?.some((term) => term.startsWith(query.toLowerCase()))
      ).slice(0, 10);
    },
    render: renderItems,
  }
})];

interface BlockEditorProps {
  initialContent?: string;
  onChange: (markdown: string) => void;
}

export default function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  // Novel handles the initial conversion if provided as content
  return (
    <EditorRoot>
      <EditorContent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialContent={initialContent as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extensions={extensions as any}
        immediatelyRender={false}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class: `prose prose-lg dark:prose-invert focus:outline-none max-w-full min-h-[500px] prose-headings:font-semibold prose-p:text-foreground/90 selection:bg-primary/20`,
          },
        }}
        onUpdate={({ editor }) => {
          const markdown = editor.storage.markdown?.getMarkdown();
          if (markdown) {
            onChange(markdown);
          }
        }}
      />
    </EditorRoot>
  );
}
