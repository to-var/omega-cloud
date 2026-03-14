import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.match import MatchRequest, MatchResponse
from app.services import matcher, tm_repository

router = APIRouter(prefix="/tm", tags=["tm"])


class TranslationPair(BaseModel):
    source: str
    target: str


class CreateTMRequest(BaseModel):
    source_language: str | None = None
    pairs: list[TranslationPair]


@router.get("")
async def list_tms():
    """List all translation memories (id, source_language, unit_count)."""
    items = await tm_repository.list_tms()
    return {"items": items}


@router.post("")
async def create_tm(body: CreateTMRequest):
    """Create a new translation memory from pairs (e.g. for scripts or admin)."""
    tm_id = str(uuid.uuid4())
    pairs = [{"source": p.source, "target": p.target} for p in body.pairs]
    await tm_repository.create_tm(tm_id, body.source_language, pairs)
    return {
        "tm_id": tm_id,
        "source_language": body.source_language,
        "unit_count": len(pairs),
    }


@router.post("/match", response_model=MatchResponse)
async def match_segments(request: MatchRequest):
    try:
        tm_pairs = await tm_repository.get_parsed(request.tm_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

    segments = [
        {"index": s.index, "source": s.source, "wordCount": s.wordCount}
        for s in request.segments
    ]

    matched = await matcher.find_matches(segments, tm_pairs)

    return MatchResponse(segments=matched)
