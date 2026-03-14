export interface Segment {
  index: number;
  source: string;
  wordCount: number;
}

/** Per-segment translation and metadata (OmegaT-style). */
export interface SegmentTranslation {
  target: string;
  changedOn: string; // ISO date
  changedBy: string;
  createdOn: string;
  createdBy: string;
  origin: "translation_memory" | "manual" | "ai_suggested";
}

export interface Match {
  target: string | null;
  confidence: number;
  matchType: "exact" | "fuzzy" | "none";
  aiSuggested: boolean;
}

export interface SegmentMatch {
  index: number;
  source: string;
  match: Match;
}

export interface MatchResponse {
  segments: SegmentMatch[];
}

export interface TMListItem {
  tm_id: string;
  source_language: string | null;
  unit_count: number;
}

export interface User {
  email: string;
  name: string;
  picture: string;
}
