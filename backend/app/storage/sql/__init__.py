"""SQL (ORM) implementations of storage protocols. Use with DATABASE_BACKEND=sql."""

from app.storage.sql.glossary import SQLGlossaryRepository
from app.storage.sql.dictionary import SQLDictionaryRepository
from app.storage.sql.tm import SQLTMRepository

__all__ = ["SQLGlossaryRepository", "SQLDictionaryRepository", "SQLTMRepository"]
