"""Languages API: supported target languages (single source of truth)."""

from fastapi import APIRouter

from app.core.languages import list_supported

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("")
async def get_languages():
    """Return supported target languages (code, name). Used for UI dropdown and filtering."""
    return {"items": list_supported()}
