import { TiptapImage } from "novel";
import TiptapLink from "@tiptap/extension-link";
import TiptapUnderline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

const lowlight = createLowlight(common);

const placeholder = Placeholder.configure({
  placeholder: ({ node }: { node: any }) => {
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`;
    }
    return "Press '/' for commands...";
  },
  includeChildren: true,
});

const tiptapImage = TiptapImage.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: "rounded-lg border border-border",
  },
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: "text-primary underline underline-offset-[3px] hover:text-primary/80 transition-colors cursor-pointer",
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: "not-prose pl-2",
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: "flex items-start my-4",
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: "mt-4 mb-6 border-t border-muted-foreground",
  },
});

export const defaultExtensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc list-outside leading-3 -mt-2",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal list-outside leading-3 -mt-2",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "leading-normal -mb-2",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-primary",
      },
    },
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class: "rounded-md bg-muted px-1.5 py-1 font-mono font-medium",
        spellcheck: "false",
      },
    },
    horizontalRule: false,
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
  }),
  tiptapImage,
  tiptapLink,
  TiptapUnderline,
  placeholder,
  Typography,
  horizontalRule,
  taskList,
  taskItem,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: "markdown",
  }),
];
