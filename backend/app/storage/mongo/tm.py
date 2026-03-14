"""MongoDB implementation of TMRepository. Seed from data/seeds/translation_memories.json when empty."""

from datetime import datetime, timezone

from app.core.database import get_database
from app.data.load_seeds import load_translation_memories_seed

COLLECTION = "translation_memories"


class MongoTMRepository:
    """Translation memory storage backed by MongoDB. Seeds demo TM from JSON when empty."""

    async def list_tms(self, target_language: str | None = None) -> list[dict]:
        db = get_database()
        match_stage = {"$match": {"target_language": target_language}} if target_language else {}
        pipeline = [
            {"$project": {
                "_id": 0,
                "tm_id": 1,
                "source_language": 1,
                "target_language": 1,
                "unit_count": {"$size": {"$ifNull": ["$pairs", []]}},
                "created_at": 1,
            }},
            {"$sort": {"created_at": -1}},
        ]
        if match_stage:
            pipeline.insert(0, match_stage)
        cursor = db[COLLECTION].aggregate(pipeline)
        return [doc async for doc in cursor]

    async def get_parsed(self, tm_id: str) -> list[dict]:
        db = get_database()
        doc = await db[COLLECTION].find_one({"tm_id": tm_id})
        if doc is None:
            raise LookupError(f"Translation memory not found: {tm_id}")
        return doc["pairs"]

    async def create_tm(
        self,
        tm_id: str,
        source_language: str | None,
        target_language: str | None,
        pairs: list[dict],
    ) -> None:
        db = get_database()
        doc = {
            "tm_id": tm_id,
            "source_language": source_language,
            "target_language": target_language,
            "pairs": pairs,
            "created_at": datetime.now(timezone.utc),
        }
        await db[COLLECTION].insert_one(doc)

    async def _count(self) -> int:
        db = get_database()
        return await db[COLLECTION].count_documents({})

    async def ensure_seeded(self) -> None:
        """If no TMs exist, load from data/seeds/translation_memories.json and insert."""
        if await self._count() > 0:
            return
        seed_docs = load_translation_memories_seed()
        if not seed_docs:
            return
        db = get_database()
        now = datetime.now(timezone.utc)
        for doc in seed_docs:
            to_insert = {
                "tm_id": doc["tm_id"],
                "source_language": doc.get("source_language"),
                "target_language": doc.get("target_language"),
                "pairs": doc.get("pairs", []),
                "created_at": now,
            }
            await db[COLLECTION].insert_one(to_insert)
