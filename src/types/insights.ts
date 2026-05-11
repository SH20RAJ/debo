export type RankedNode = {
  type: "person" | "topic" | "emotion" | "event";
  name: string;
  score?: number;
};

export type Pattern = {
  entity: string;
  count: number;
};

export type InsightSnapshot = {
  topPerson: RankedNode | null;
  topEmotion: RankedNode | null;
  topTopic: RankedNode | null;
  patterns: Pattern[];
  journalCount: number;
};
