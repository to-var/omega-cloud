import uuid

from fastapi import APIRouter, Depends, UploadFile

from app.core.dependencies import get_current_user
from app.models.match import MatchRequest, MatchResponse
from app.services import matcher, storage, tmx_parser

router = APIRouter(prefix="/tm", tags=["tm"])


@router.post("/upload")
async def upload_tm(file: UploadFile, user: dict = Depends(get_current_user)):
    file_bytes = await file.read()
    tm_id = str(uuid.uuid4())

    pairs, source_lang = tmx_parser.parse_tmx(file_bytes)

    storage.upload_tmx(file_bytes, tm_id)
    storage.upload_parsed(pairs, tm_id)

    return {
        "tm_id": tm_id,
        "source_language": source_lang,
        "unit_count": len(pairs),
    }


@router.post("/match", response_model=MatchResponse)
async def match_segments(
    request: MatchRequest, user: dict = Depends(get_current_user)
):
    tm_pairs = storage.get_parsed(request.tm_id)

    segments = [
        {"index": s.index, "source": s.source, "wordCount": s.wordCount}
        for s in request.segments
    ]

    matched = await matcher.find_matches(segments, tm_pairs)

    return MatchResponse(segments=matched)
