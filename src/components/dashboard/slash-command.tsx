import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { Editor, Range, Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  Code,
  CheckSquare,
  Type,
  Minus,
} from "lucide-react";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";

interface CommandItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  searchTerms?: string[];
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

export const suggestionItems: CommandItemProps[] = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a todo list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any).chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any)
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any)
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any)
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any).chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any).chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Divider",
    description: "Visually divide your content.",
    searchTerms: ["line", "hr", "horizontal"],
    icon: <Minus className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any).chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code className="w-4 h-4" />,
    command: ({ editor, range }) => {
      (editor as any).chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
];

export const CommandList = ({
  items,
  command,
}: {
  items: CommandItemProps[];
  command: any;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [command, items]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }

      if (e.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }

      if (e.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [items, selectedIndex, selectItem]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  return items.length > 0 ? (
    <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
      {items.map((item: CommandItemProps, index: number) => {
        return (
          <button
            className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent ${
              index === selectedIndex ? "bg-accent text-accent-foreground" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
              {item.icon}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  ) : null;
};

export const slashCommand = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      const { element } = component;

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props);

      popup?.[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();

        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};
