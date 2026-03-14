"""SQLAlchemy implementation of GlossaryRepository. Seed data from JSON."""

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.load_seeds import load_glossary_seed
from app.db.models import GlossaryEntry
from app.db.session import get_session_factory


class SQLGlossaryRepository:
    """Glossary storage backed by SQL (SQLAlchemy ORM). Seeds from data/seeds/glossary.json when empty."""

    async def get_all_entries(self, target_language: str | None = None) -> list[dict]:
        factory = get_session_factory()
        async with factory() as session:
            stmt = select(GlossaryEntry)
            if target_language:
                stmt = stmt.where(GlossaryEntry.target_language == target_language)
            result = await session.execute(stmt)
            rows = result.scalars().all()
            return [r.to_dict() for r in rows]

    async def _count(self, session: AsyncSession) -> int:
        from sqlalchemy import func
        result = await session.execute(select(func.count()).select_from(GlossaryEntry))
        return result.scalar() or 0

    async def ensure_seeded(self) -> None:
        factory = get_session_factory()
        async with factory() as session:
            if await self._count(session) > 0:
                return
            entries = load_glossary_seed()
            if not entries:
                return
            now = datetime.now(timezone.utc)
            for e in entries:
                session.add(GlossaryEntry(
                    source=e["source"],
                    target=e["target"],
                    target_language=e.get("target_language"),
                    created_at=now,
                ))
            await session.commit()
