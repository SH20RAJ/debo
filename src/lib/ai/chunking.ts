import "server-only";

export type ChunkOptions = {
  minWords?: number;
  maxWords?: number;
  overlapWords?: number;
};

const DEFAULT_CHUNK_OPTIONS: Required<ChunkOptions> = {
  minWords: 200,
  maxWords: 400,
  overlapWords: 60,
};

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string) {
  const value = normalizeText(text);

  if (!value) {
    return [] as string[];
  }

  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("en", { granularity: "sentence" })
      : null;

  if (segmenter) {
    return Array.from(segmenter.segment(value), (segment) => segment.segment.trim()).filter(Boolean);
  }

  return value
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function countWords(text: string) {
  return normalizeText(text).split(/\s+/).filter(Boolean).length;
}

export function splitIntoChunks(text: string, options: ChunkOptions = {}) {
  const { minWords, maxWords, overlapWords } = {
    ...DEFAULT_CHUNK_OPTIONS,
    ...options,
  };

  const sentences = splitSentences(text);

  if (sentences.length === 0) {
    return [] as string[];
  }

  if (countWords(text) <= maxWords) {
    return [normalizeText(text)];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < sentences.length) {
    let endIndex = startIndex;
    let wordCount = 0;

    while (endIndex < sentences.length) {
      const sentence = sentences[endIndex];
      const sentenceWords = countWords(sentence);

      if (endIndex > startIndex && wordCount + sentenceWords > maxWords) {
        break;
      }

      wordCount += sentenceWords;
      endIndex += 1;

      if (wordCount >= minWords) {
        const atEnd = endIndex >= sentences.length;
        if (atEnd || wordCount >= Math.min(maxWords, minWords + 120)) {
          break;
        }
      }
    }

    if (endIndex <= startIndex) {
      endIndex = Math.min(startIndex + 1, sentences.length);
    }

    const chunk = sentences.slice(startIndex, endIndex).join(" ").trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (endIndex >= sentences.length) {
      break;
    }

    let nextStartIndex = startIndex;
    let overlapCount = 0;

    while (nextStartIndex < endIndex && overlapCount < overlapWords) {
      const candidate = nextStartIndex + 1;
      const candidateText = sentences.slice(candidate, endIndex).join(" ");
      const candidateWords = countWords(candidateText);

      if (candidateWords < overlapWords) {
        break;
      }

      nextStartIndex = candidate;
      overlapCount = candidateWords;
    }

    if (nextStartIndex === startIndex) {
      nextStartIndex = Math.max(0, endIndex - 1);
    }

    startIndex = nextStartIndex;
  }

  return chunks;
}