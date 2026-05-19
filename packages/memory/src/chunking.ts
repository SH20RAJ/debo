/**
 * Text chunking for the memory engine.
 *
 * Follows backend.md section 11.4 rules:
 * - Prefer semantic chunks over fixed-size chunks
 * - Keep chunk size around 400-900 tokens
 * - Keep overlap around 60-120 tokens
 * - Preserve headings, page numbers, timestamps, speaker labels
 * - Never chunk without source metadata
 */

// Approximate tokens: 1 token ~ 4 characters for English
const CHARS_PER_TOKEN = 4;

export type ChunkOptions = {
  minTokens?: number;
  maxTokens?: number;
  overlapTokens?: number;
};

export type TextChunk = {
  content: string;
  index: number;
  startOffset: number;
  endOffset: number;
  heading?: string;
  tokenCount: number;
};

export type TranscriptChunk = TextChunk & {
  timestamp?: string;
  speaker?: string;
};

export type DocumentChunk = TextChunk & {
  pageNumber?: number;
};

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  minTokens: 400,
  maxTokens: 900,
  overlapTokens: 80,
};

/**
 * Estimate token count from text length.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Split text into semantic chunks respecting headings and paragraph boundaries.
 *
 * Strategy:
 * 1. Split by headings (## / ### / **bold**) and paragraphs
 * 2. Merge small sections until reaching minTokens
 * 3. Split oversized sections at sentence boundaries
 * 4. Add overlap between adjacent chunks
 */
export function chunkText(text: string, options?: ChunkOptions): TextChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const minChars = opts.minTokens * CHARS_PER_TOKEN;
  const maxChars = opts.maxTokens * CHARS_PER_TOKEN;
  const overlapChars = opts.overlapTokens * CHARS_PER_TOKEN;

  if (!text || !text.trim()) {
    return [];
  }

  const sections = splitIntoSections(text);
  const merged = mergeSmallSections(sections, minChars);
  const split = splitOversizedSections(merged, maxChars, minChars);
  const chunks = addOverlap(split, overlapChars);

  return chunks.map((chunk, index) => ({
    content: chunk.content,
    index,
    startOffset: chunk.startOffset,
    endOffset: chunk.endOffset,
    heading: chunk.heading,
    tokenCount: estimateTokens(chunk.content),
  }));
}

type Section = {
  content: string;
  heading?: string;
  startOffset: number;
  endOffset: number;
};

/**
 * Split text by headings and double-newlines into sections.
 */
function splitIntoSections(text: string): Section[] {
  const sections: Section[] = [];
  // Match markdown headings: ## Heading, ### Heading, **Bold heading**
  const headingRegex = /^(#{1,4}\s+.+|[A-Z][^\n]{2,80}\n[-=]{3,})$/gm;
  const headings: Array<{ index: number; text: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(text)) !== null) {
    headings.push({ index: match.index, text: match[0] });
  }

  if (headings.length === 0) {
    // No headings — split by double newlines
    return splitByParagraphs(text, 0);
  }

  // Split by heading boundaries
  let cursor = 0;

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];

    if (heading.index > cursor) {
      const before = text.slice(cursor, heading.index).trim();
      if (before) {
        sections.push(...splitByParagraphs(before, cursor));
      }
    }

    const end = i + 1 < headings.length ? headings[i + 1].index : text.length;
    const sectionText = text.slice(heading.index, end).trim();

    if (sectionText) {
      sections.push({
        content: sectionText,
        heading: heading.text.replace(/^#+\s*/, "").replace(/\n[-=]+$/, "").trim(),
        startOffset: heading.index,
        endOffset: end,
      });
    }

    cursor = end;
  }

  if (cursor < text.length) {
    const remaining = text.slice(cursor).trim();
    if (remaining) {
      sections.push(...splitByParagraphs(remaining, cursor));
    }
  }

  return sections;
}

function splitByParagraphs(text: string, baseOffset: number): Section[] {
  const paragraphs = text.split(/\n{2,}/);
  const sections: Section[] = [];
  let offset = baseOffset;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed) {
      sections.push({
        content: trimmed,
        startOffset: offset,
        endOffset: offset + trimmed.length,
      });
    }
    offset += para.length + 2; // +2 for the double newline
  }

  return sections;
}

/**
 * Merge adjacent small sections to reach minChars.
 */
function mergeSmallSections(sections: Section[], minChars: number): Section[] {
  if (sections.length === 0) return [];

  const merged: Section[] = [];
  let current = { ...sections[0] };

  for (let i = 1; i < sections.length; i++) {
    const next = sections[i];

    if (current.content.length < minChars) {
      // Merge with next
      current.content = `${current.content}\n\n${next.content}`;
      current.endOffset = next.endOffset;
      // Keep the first heading if present
      if (!current.heading && next.heading) {
        current.heading = next.heading;
      }
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Split oversized sections at sentence boundaries.
 */
function splitOversizedSections(sections: Section[], maxChars: number, minChars: number): Section[] {
  const result: Section[] = [];

  for (const section of sections) {
    if (section.content.length <= maxChars) {
      result.push(section);
      continue;
    }

    const sentences = splitSentences(section.content);
    let chunk = "";
    let chunkStart = section.startOffset;

    for (const sentence of sentences) {
      if (chunk.length + sentence.length > maxChars && chunk.length >= minChars) {
        result.push({
          content: chunk.trim(),
          heading: section.heading,
          startOffset: chunkStart,
          endOffset: chunkStart + chunk.length,
        });
        chunk = sentence;
        chunkStart = chunkStart + chunk.length;
      } else {
        chunk += (chunk ? " " : "") + sentence;
      }
    }

    if (chunk.trim()) {
      result.push({
        content: chunk.trim(),
        heading: section.heading,
        startOffset: chunkStart,
        endOffset: section.endOffset,
      });
    }
  }

  return result;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Add overlap between adjacent chunks.
 */
function addOverlap(sections: Section[], overlapChars: number): Section[] {
  if (sections.length <= 1 || overlapChars <= 0) return sections;

  const result: Section[] = [sections[0]];

  for (let i = 1; i < sections.length; i++) {
    const prev = sections[i - 1];
    const current = sections[i];

    // Take last overlapChars from previous chunk
    const overlapText = prev.content.slice(-overlapChars);
    // Find a clean word boundary
    const spaceIndex = overlapText.indexOf(" ");
    const cleanOverlap = spaceIndex > 0 ? overlapText.slice(spaceIndex + 1) : overlapText;

    result.push({
      ...current,
      content: `${cleanOverlap} ${current.content}`,
      startOffset: current.startOffset,
    });
  }

  return result;
}

/**
 * Chunk a transcript with timestamps and speaker labels.
 *
 * Each transcript segment is expected as: { text, timestamp?, speaker? }
 */
export function chunkTranscript(
  segments: Array<{ text: string; timestamp?: string; speaker?: string }>,
  options?: ChunkOptions
): TranscriptChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxChars = opts.maxTokens * CHARS_PER_TOKEN;
  const minChars = opts.minTokens * CHARS_PER_TOKEN;

  const chunks: TranscriptChunk[] = [];
  let currentContent = "";
  let currentTimestamp: string | undefined;
  let currentSpeaker: string | undefined;
  let currentStartOffset = 0;
  let offset = 0;

  for (const segment of segments) {
    const segmentText = segment.text.trim();
    if (!segmentText) continue;

    if (!currentTimestamp) {
      currentTimestamp = segment.timestamp;
      currentSpeaker = segment.speaker;
    }

    const candidate = currentContent
      ? `${currentContent} ${segmentText}`
      : segmentText;

    if (candidate.length > maxChars && currentContent.length >= minChars) {
      chunks.push({
        content: currentContent.trim(),
        index: chunks.length,
        startOffset: currentStartOffset,
        endOffset: offset,
        timestamp: currentTimestamp,
        speaker: currentSpeaker,
        tokenCount: estimateTokens(currentContent),
      });
      currentContent = segmentText;
      currentTimestamp = segment.timestamp;
      currentSpeaker = segment.speaker;
      currentStartOffset = offset;
    } else {
      currentContent = candidate;
    }

    offset += segmentText.length + 1;
  }

  if (currentContent.trim()) {
    chunks.push({
      content: currentContent.trim(),
      index: chunks.length,
      startOffset: currentStartOffset,
      endOffset: offset,
      timestamp: currentTimestamp,
      speaker: currentSpeaker,
      tokenCount: estimateTokens(currentContent),
    });
  }

  // Re-index
  return chunks.map((chunk, i) => ({ ...chunk, index: i }));
}

/**
 * Chunk a document preserving page numbers.
 *
 * Each page is expected as: { text, pageNumber }
 */
export function chunkDocument(
  pages: Array<{ text: string; pageNumber: number }>,
  options?: ChunkOptions
): DocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxChars = opts.maxTokens * CHARS_PER_TOKEN;
  const minChars = opts.minTokens * CHARS_PER_TOKEN;

  const chunks: DocumentChunk[] = [];
  let currentContent = "";
  let currentPage: number | undefined;
  let currentStartOffset = 0;
  let offset = 0;

  for (const page of pages) {
    const pageText = page.text.trim();
    if (!pageText) continue;

    if (currentPage === undefined) {
      currentPage = page.pageNumber;
    }

    const candidate = currentContent
      ? `${currentContent}\n\n${pageText}`
      : pageText;

    if (candidate.length > maxChars && currentContent.length >= minChars) {
      chunks.push({
        content: currentContent.trim(),
        index: chunks.length,
        startOffset: currentStartOffset,
        endOffset: offset,
        pageNumber: currentPage,
        tokenCount: estimateTokens(currentContent),
      });
      currentContent = pageText;
      currentPage = page.pageNumber;
      currentStartOffset = offset;
    } else {
      currentContent = candidate;
      // Track which page the chunk primarily covers
      if (candidate.length > maxChars * 0.5) {
        currentPage = page.pageNumber;
      }
    }

    offset += pageText.length + 2;
  }

  if (currentContent.trim()) {
    chunks.push({
      content: currentContent.trim(),
      index: chunks.length,
      startOffset: currentStartOffset,
      endOffset: offset,
      pageNumber: currentPage,
      tokenCount: estimateTokens(currentContent),
    });
  }

  return chunks.map((chunk, i) => ({ ...chunk, index: i }));
}
