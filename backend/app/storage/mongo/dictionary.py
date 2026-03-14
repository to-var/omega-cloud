"""MongoDB implementation of DictionaryRepository. Seed data from JSON."""

from datetime import datetime, timezone

from app.core.database import get_database
from app.data.load_seeds import load_dictionary_seed

COLLECTION = "dictionary"


class MongoDictionaryRepository:
    """Dictionary storage backed by MongoDB. Seeds from data/seeds/dictionary.json when empty."""

    async def get_all_entries(self, target_language: str | None = None) -> list[dict]:
        db = get_database()
        q = {} if not target_language else {"target_language": target_language}
        cursor = db[COLLECTION].find(q, {"_id": 0, "term": 1, "definition": 1, "target_language": 1})
        return [doc async for doc in cursor]

    async def _count(self) -> int:
        db = get_database()
        return await db[COLLECTION].count_documents({})

    async def ensure_seeded(self) -> None:
        if await self._count() > 0:
            return
        entries = load_dictionary_seed()
        if not entries:
            return
        db = get_database()
        now = datetime.now(timezone.utc)
        docs = [{**e, "created_at": now, "target_language": e.get("target_language") or ""} for e in entries]
        await db[COLLECTION].insert_many(docs)
