export interface Segment {
  index: number;
  source: string;
  wordCount: number;
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

export interface UploadResponse {
  tm_id: string;
  source_language: string | null;
  unit_count: number;
}

export interface User {
  email: string;
  name: string;
  picture: string;
}
