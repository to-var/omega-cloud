from pydantic import BaseModel

from app.models.segment import Segment


class Match(BaseModel):
    target: str | None
    confidence: int
    matchType: str  # "exact" | "fuzzy" | "none"
    aiSuggested: bool


class SegmentMatch(BaseModel):
    index: int
    source: str
    match: Match


class MatchRequest(BaseModel):
    segments: list[Segment]
    tm_id: str


class MatchResponse(BaseModel):
    segments: list[SegmentMatch]
