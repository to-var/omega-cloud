"""Translation memory persistence in MongoDB."""

from datetime import datetime, timezone

from app.core.database import get_database

COLLECTION = "translation_memories"

# Seed TM created when no translation memories exist (e.g. fresh app start).
DEFAULT_TM_SEED = {
    "tm_id": "default",
    "source_language": "en",
    "pairs": [
        {"source": "Welcome to the project.", "target": "Bienvenue au projet."},
        {"source": "Click here to continue.", "target": "Cliquez ici pour continuer."},
        {"source": "Save your work regularly.", "target": "Enregistrez votre travail régulièrement."},
    ],
}


async def create_tm(tm_id: str, source_language: str | None, pairs: list[dict]) -> None:
    """Store a translation memory in the database."""
    db = get_database()
    doc = {
        "tm_id": tm_id,
        "source_language": source_language,
        "pairs": pairs,
        "created_at": datetime.now(timezone.utc),
    }
    await db[COLLECTION].insert_one(doc)


async def get_parsed(tm_id: str) -> list[dict]:
    """Return the parsed translation pairs for a TM. Raises if not found."""
    db = get_database()
    doc = await db[COLLECTION].find_one({"tm_id": tm_id})
    if doc is None:
        raise LookupError(f"Translation memory not found: {tm_id}")
    return doc["pairs"]


async def list_tms() -> list[dict]:
    """Return all TMs with tm_id, source_language, and unit_count (no pairs)."""
    db = get_database()
    cursor = db[COLLECTION].aggregate([
        {"$project": {
            "_id": 0,
            "tm_id": 1,
            "source_language": 1,
            "unit_count": {"$size": {"$ifNull": ["$pairs", []]}},
            "created_at": 1,
        }},
        {"$sort": {"created_at": -1}},
    ])
    return [doc async for doc in cursor]


async def count_tms() -> int:
    """Return the number of translation memories in the database."""
    db = get_database()
    return await db[COLLECTION].count_documents({})


async def ensure_default_tm() -> None:
    """If no TMs exist, create a default seed TM so the app is usable from first run."""
    if await count_tms() > 0:
        return
    doc = {
        **DEFAULT_TM_SEED,
        "created_at": datetime.now(timezone.utc),
    }
    db = get_database()
    await db[COLLECTION].insert_one(doc)
