"""SQLAlchemy implementation of DictionaryRepository. Seed data from JSON."""

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.load_seeds import load_dictionary_seed
from app.db.models import DictionaryEntry
from app.db.session import get_session_factory


class SQLDictionaryRepository:
    """Dictionary storage backed by SQL (SQLAlchemy ORM). Seeds from data/seeds/dictionary.json when empty."""

    async def get_all_entries(self, target_language: str | None = None) -> list[dict]:
        factory = get_session_factory()
        async with factory() as session:
            stmt = select(DictionaryEntry)
            if target_language:
                stmt = stmt.where(DictionaryEntry.target_language == target_language)
            result = await session.execute(stmt)
            rows = result.scalars().all()
            return [r.to_dict() for r in rows]

    async def _count(self, session: AsyncSession) -> int:
        from sqlalchemy import func
        result = await session.execute(select(func.count()).select_from(DictionaryEntry))
        return result.scalar() or 0

    async def ensure_seeded(self) -> None:
        factory = get_session_factory()
        async with factory() as session:
            if await self._count(session) > 0:
                return
            entries = load_dictionary_seed()
            if not entries:
                return
            now = datetime.now(timezone.utc)
            for e in entries:
                session.add(DictionaryEntry(
                    term=e["term"],
                    definition=e["definition"],
                    target_language=e.get("target_language"),
                    created_at=now,
                ))
            await session.commit()
