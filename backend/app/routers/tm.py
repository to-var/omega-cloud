import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.dependencies import get_tm_repository
from app.models.match import MatchRequest, MatchResponse
from app.services import matcher
from app.storage.protocols import TMRepository

router = APIRouter(prefix="/tm", tags=["tm"])


class TranslationPair(BaseModel):
    source: str
    target: str


class CreateTMRequest(BaseModel):
    source_language: str | None = None
    target_language: str | None = None
    pairs: list[TranslationPair]


@router.get("")
async def list_tms(
    target_language: str | None = None,
    repo: TMRepository = Depends(get_tm_repository),
):
    """List translation memories (tm_id, source_language, target_language, unit_count). Optionally filter by target_language."""
    items = await repo.list_tms(target_language=target_language)
    return {"items": items}


@router.post("")
async def create_tm(
    body: CreateTMRequest,
    repo: TMRepository = Depends(get_tm_repository),
):
    """Create a new translation memory from pairs (e.g. for scripts or admin)."""
    tm_id = str(uuid.uuid4())
    pairs = [{"source": p.source, "target": p.target} for p in body.pairs]
    await repo.create_tm(tm_id, body.source_language, body.target_language, pairs)
    return {
        "tm_id": tm_id,
        "source_language": body.source_language,
        "target_language": body.target_language,
        "unit_count": len(pairs),
    }


@router.post("/match", response_model=MatchResponse)
async def match_segments(
    request: MatchRequest,
    repo: TMRepository = Depends(get_tm_repository),
):
    try:
        tm_pairs = await repo.get_parsed(request.tm_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

    segments = [
        {"index": s.index, "source": s.source, "wordCount": s.wordCount}
        for s in request.segments
    ]

    matched = await matcher.find_matches(segments, tm_pairs)

    return MatchResponse(segments=matched)
