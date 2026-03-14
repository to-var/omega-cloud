"""Glossary API: project glossary (source → target terms)."""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_glossary_repository
from app.storage.protocols import GlossaryRepository

router = APIRouter(prefix="/glossary", tags=["glossary"])


@router.get("")
async def get_glossary(
    target_language: str | None = None,
    repo: GlossaryRepository = Depends(get_glossary_repository),
):
    """Return glossary entries (source, target, target_language). Optionally filter by target_language."""
    entries = await repo.get_all_entries(target_language=target_language)
    return {"entries": entries}
