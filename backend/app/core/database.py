"""MongoDB connection and database access."""

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    """Return the global async MongoDB client."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _client


def get_database():
    """Return the application database."""
    return get_client()[settings.MONGODB_DB_NAME]


async def ensure_indexes():
    """Create indexes for TM collection (e.g. for future multi-tenant by tenant_id)."""
    db = get_database()
    await db.translation_memories.create_index("tm_id", unique=True)
