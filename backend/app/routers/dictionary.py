"""Dictionary API: term definitions."""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_dictionary_repository
from app.storage.protocols import DictionaryRepository

router = APIRouter(prefix="/dictionary", tags=["dictionary"])


@router.get("")
async def get_dictionary(
    target_language: str | None = None,
    repo: DictionaryRepository = Depends(get_dictionary_repository),
):
    """Return dictionary entries (term, definition, target_language). Optionally filter by target_language."""
    entries = await repo.get_all_entries(target_language=target_language)
    return {"entries": entries}
