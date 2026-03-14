from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.providers.ai import get_ai_provider

router = APIRouter(prefix="/ai", tags=["ai"])


class SuggestedTerm(BaseModel):
    source: str
    target: str


class TranslateRequest(BaseModel):
    segment_source: str
    suggested_terms: list[SuggestedTerm] = []
    target_language: str | None = None


class TranslateResponse(BaseModel):
    translation: str


@router.post("/translate", response_model=TranslateResponse)
async def translate_with_glossary(body: TranslateRequest):
    """Translate a segment using the configured AI provider, applying suggested glossary terms."""
    if not body.segment_source.strip():
        raise HTTPException(status_code=400, detail="segment_source cannot be empty")
    try:
        provider = get_ai_provider()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    terms = [{"source": t.source, "target": t.target} for t in body.suggested_terms]
    translation = await provider.translate_with_terms(
        body.segment_source, terms, target_language=body.target_language
    )
    return TranslateResponse(translation=translation)
