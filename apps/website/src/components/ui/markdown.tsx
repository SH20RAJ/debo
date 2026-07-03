"use client";

import React, { useMemo } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownProps {
 content: string;
 className?: string;
}

export function Markdown({ content, className = "" }: MarkdownProps) {
 const renderedContent = useMemo(() => {
 if (!content) return null;

 const lines = content.split("\n");
 const elements: React.ReactNode[] = [];

 let inCodeBlock = false;
 let codeLines: string[] = [];
 let codeLang = "";
 let inUnorderedList = false;
 let inOrderedList = false;
 let listItems: string[] = [];
 let paragraphLines: string[] = [];

 const flushParagraph = (key: string) => {
 if (paragraphLines.length > 0) {
 elements.push(
 <p key={`p-${key}`} className="text-sm text-foreground/90 leading-relaxed mb-3 last:mb-0">
 {renderInline(paragraphLines.join(" "))}
 </p>
 );
 paragraphLines = [];
 }
 };

 const flushUnorderedList = (key: string) => {
 if (listItems.length > 0) {
 elements.push(
 <ul key={`ul-${key}`} className="list-disc pl-5 mb-3 space-y-1 text-sm text-foreground/90">
 {listItems.map((item, idx) => (
 <li key={idx} className="marker:text-emerald-500/80">
 {renderInline(item)}
 </li>
 ))}
 </ul>
 );
 listItems = [];
 inUnorderedList = false;
 }
 };

 const flushOrderedList = (key: string) => {
 if (listItems.length > 0) {
 elements.push(
 <ol key={`ol-${key}`} className="list-decimal pl-5 mb-3 space-y-1 text-sm text-foreground/90">
 {listItems.map((item, idx) => (
 <li key={idx} className="marker:text-emerald-500/80 marker:font-semibold">
 {renderInline(item)}
 </li>
 ))}
 </ol>
 );
 listItems = [];
 inOrderedList = false;
 }
 };

 const flushLists = (key: string) => {
 if (inUnorderedList) flushUnorderedList(key);
 if (inOrderedList) flushOrderedList(key);
 };

 for (let i = 0; i < lines.length; i++) {
 const line = lines[i];
 const trimmedLine = line.trim();

 // Handle Code Blocks
 if (trimmedLine.startsWith("```")) {
 if (inCodeBlock) {
 // End of code block
 elements.push(
 <CodeBlock
 key={`code-${i}`}
 code={codeLines.join("\n")}
 language={codeLang}
 />
 );
 codeLines = [];
 codeLang = "";
 inCodeBlock = false;
 } else {
 // Start of code block
 flushParagraph(`precode-${i}`);
 flushLists(`precode-list-${i}`);
 inCodeBlock = true;
 codeLang = trimmedLine.slice(3).trim();
 }
 continue;
 }

 if (inCodeBlock) {
 codeLines.push(line);
 continue;
 }

 // Handle Headers
 if (trimmedLine.startsWith("#")) {
 flushParagraph(`hdr-${i}`);
 flushLists(`hdr-list-${i}`);

 const match = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
 if (match) {
 const level = match[1].length;
 const text = match[2];
 const headerClasses = "font-bold text-foreground tracking-tight mt-4 mb-2 first:mt-0";

 if (level === 1) {
 elements.push(<h1 key={`h1-${i}`} className={`text-xl ${headerClasses}`}>{renderInline(text)}</h1>);
 } else if (level === 2) {
 elements.push(<h2 key={`h2-${i}`} className={`text-lg ${headerClasses}`}>{renderInline(text)}</h2>);
 } else {
 elements.push(<h3 key={`h3-${i}`} className={`text-base ${headerClasses}`}>{renderInline(text)}</h3>);
 }
 continue;
 }
 }

 // Handle Blockquotes
 if (trimmedLine.startsWith(">")) {
 flushParagraph(`bq-${i}`);
 flushLists(`bq-list-${i}`);
 const content = trimmedLine.replace(/^>\s*/, "");
 elements.push(
 <blockquote key={`bq-${i}`} className="border-l-4 border-emerald-500 bg-emerald-500/5 px-4 py-2.5 rounded-r-xl my-3 italic text-sm text-foreground/80 leading-relaxed">
 {renderInline(content)}
 </blockquote>
 );
 continue;
 }

 // Handle Horizontal Rule
 if (trimmedLine === "---" || trimmedLine === "***" || trimmedLine === "___") {
 flushParagraph(`hr-${i}`);
 flushLists(`hr-list-${i}`);
 elements.push(<hr key={`hr-${i}`} className="my-4 border-border/80" />);
 continue;
 }

 // Handle Unordered List Items
 if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
 if (inOrderedList) flushOrderedList(`switch-${i}`);
 flushParagraph(`list-${i}`);

 inUnorderedList = true;
 listItems.push(trimmedLine.slice(2));
 continue;
 }

 // Handle Ordered List Items
 const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
 if (orderedMatch) {
 if (inUnorderedList) flushUnorderedList(`switch-${i}`);
 flushParagraph(`list-${i}`);

 inOrderedList = true;
 listItems.push(orderedMatch[2]);
 continue;
 }

 // Handle Empty Line (Paragraph Break)
 if (trimmedLine === "") {
 flushParagraph(`empty-${i}`);
 flushLists(`empty-list-${i}`);
 continue;
 }

 // regular paragraph content (accumulate lines for word wrapping)
 if (inUnorderedList || inOrderedList) {
 // Continue list item content if line is indented
 if (line.startsWith(" ") || line.startsWith("\t")) {
 const lastIdx = listItems.length - 1;
 if (lastIdx >= 0) {
 listItems[lastIdx] += " " + trimmedLine;
 continue;
 }
 } else {
 flushLists(`break-${i}`);
 }
 }

 paragraphLines.push(trimmedLine);
 }

 // Flush remaining
 const finalKey = lines.length.toString();
 flushParagraph(finalKey);
 flushLists(finalKey);

 // If stream ended with unclosed code block, display it
 if (inCodeBlock && codeLines.length > 0) {
 elements.push(
 <CodeBlock
 key="code-final"
 code={codeLines.join("\n")}
 language={codeLang}
 />
 );
 }

 return elements;
 }, [content]);

 return <div className={`prose-sm max-w-none ${className}`}>{renderedContent}</div>;
}

/** Render inline Markdown formatting (bold, italic, code, link) */
function renderInline(text: string): React.ReactNode[] {
 // Regex to split text by markdown links, inline code, bold, italic
 const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
 const parts = text.split(inlineRegex);

 return parts.map((part, index) => {
 // Bold
 if (part.startsWith("**") && part.endsWith("**")) {
 return (
 <strong key={index} className="font-bold text-foreground">
 {part.slice(2, -2)}
 </strong>
 );
 }
 // Italic
 if (part.startsWith("*") && part.endsWith("*")) {
 return (
 <em key={index} className="italic text-foreground/90">
 {part.slice(1, -1)}
 </em>
 );
 }
 // Inline Code
 if (part.startsWith("`") && part.endsWith("`")) {
 return (
 <code
 key={index}
 className="px-1.5 py-0.5 rounded-md bg-muted/80 text-emerald-500 font-mono text-xs border border-border/40 select-all"
 >
 {part.slice(1, -1)}
 </code>
 );
 }
 // Links
 const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
 if (linkMatch) {
 return (
 <a
 key={index}
 href={linkMatch[2]}
 target="_blank"
 rel="noopener noreferrer"
 className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 decoration-primary/40"
 >
 {linkMatch[1]}
 </a>
 );
 }

 return part;
 });
}

interface CodeBlockProps {
 code: string;
 language?: string;
}

function CodeBlock({ code, language = "" }: CodeBlockProps) {
 const [copied, setCopied] = React.useState(false);

 const handleCopy = async () => {
 try {
 await navigator.clipboard.writeText(code);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 } catch {
 // fallback
 }
 };

 return (
 <div className="relative group my-4 rounded-xl border border-white/5 bg-[#0f140d]/90 overflow-hidden shadow-md">
 <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#090d08] text-xs text-muted-foreground select-none">
 <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500/70">
 {language || "code"}
 </span>
 <button
 onClick={handleCopy}
 className="p-1 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
 >
 {copied ? (
 <>
 <Check className="w-3.5 h-3.5 text-emerald-500" />
 <span className="text-[10px] text-emerald-500 font-medium">Copied!</span>
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5" />
 <span className="text-[10px]">Copy</span>
 </>
 )}
 </button>
 </div>
 <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-foreground/90 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
 <pre className="m-0 whitespace-pre">{code}</pre>
 </div>
 </div>
 );
}
