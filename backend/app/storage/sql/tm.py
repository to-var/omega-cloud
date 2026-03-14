"""SQLAlchemy implementation of TMRepository. Seed from data/seeds/translation_memories.json when empty."""

from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.data.load_seeds import load_translation_memories_seed
from app.db.models import TranslationMemory, TranslationPair
from app.db.session import get_session_factory


class SQLTMRepository:
    """Translation memory storage backed by SQL (SQLAlchemy ORM). Seeds demo TM from JSON when empty."""

    async def list_tms(self, target_language: str | None = None) -> list[dict]:
        factory = get_session_factory()
        async with factory() as session:
            stmt = (
                select(
                    TranslationMemory,
                    func.count(TranslationPair.id).label("unit_count"),
                )
                .outerjoin(TranslationPair)
                .group_by(TranslationMemory.id)
                .order_by(TranslationMemory.created_at.desc())
            )
            if target_language:
                stmt = stmt.where(TranslationMemory.target_language == target_language)
            result = await session.execute(stmt)
            rows = result.all()
            out = []
            for tm, unit_count in rows:
                out.append({
                    "tm_id": tm.tm_id,
                    "source_language": tm.source_language,
                    "target_language": tm.target_language,
                    "unit_count": unit_count or 0,
                    "created_at": tm.created_at.isoformat() if tm.created_at else None,
                })
            return out

    async def get_parsed(self, tm_id: str) -> list[dict]:
        factory = get_session_factory()
        async with factory() as session:
            result = await session.execute(
                select(TranslationMemory).where(TranslationMemory.tm_id == tm_id).options(selectinload(TranslationMemory.pairs))
            )
            tm = result.scalar_one_or_none()
            if tm is None:
                raise LookupError(f"Translation memory not found: {tm_id}")
            return [{"source": p.source, "target": p.target} for p in tm.pairs]

    async def create_tm(
        self,
        tm_id: str,
        source_language: str | None,
        target_language: str | None,
        pairs: list[dict],
    ) -> None:
        factory = get_session_factory()
        async with factory() as session:
            tm = TranslationMemory(
                tm_id=tm_id,
                source_language=source_language,
                target_language=target_language,
                created_at=datetime.now(timezone.utc),
            )
            session.add(tm)
            await session.flush()
            for p in pairs:
                session.add(TranslationPair(tm_id=tm.id, source=p["source"], target=p["target"]))
            await session.commit()

    async def _count(self, session: AsyncSession) -> int:
        result = await session.execute(select(func.count()).select_from(TranslationMemory))
        return result.scalar() or 0

    async def ensure_seeded(self) -> None:
        """If no TMs exist, load from data/seeds/translation_memories.json and insert."""
        factory = get_session_factory()
        async with factory() as session:
            if await self._count(session) > 0:
                return
            seed_docs = load_translation_memories_seed()
            if not seed_docs:
                return
            now = datetime.now(timezone.utc)
            for doc in seed_docs:
                tm = TranslationMemory(
                    tm_id=doc["tm_id"],
                    source_language=doc.get("source_language"),
                    target_language=doc.get("target_language"),
                    created_at=now,
                )
                session.add(tm)
                await session.flush()
                for p in doc.get("pairs", []):
                    session.add(TranslationPair(tm_id=tm.id, source=p["source"], target=p["target"]))
            await session.commit()
