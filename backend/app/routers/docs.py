import re

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.segment import Segment

router = APIRouter(prefix="/docs", tags=["docs"])


def split_into_segments(text: str) -> list[Segment]:
    """Split text into translatable segments on sentence boundaries."""
    raw = re.split(r"(?<=[.!?])\s+|\n+", text)
    segments: list[Segment] = []
    for chunk in raw:
        chunk = chunk.strip()
        if not chunk:
            continue
        word_count = len(chunk.split())
        segments.append(Segment(index=len(segments), source=chunk, wordCount=word_count))
    return segments


class ExtractSegmentsRequest(BaseModel):
    text: str


@router.post("/segments", response_model=list[Segment])
async def extract_segments(body: ExtractSegmentsRequest):
    """Extract segments from plain text (e.g. from a rich text editor)."""
    return split_into_segments(body.text or "")
