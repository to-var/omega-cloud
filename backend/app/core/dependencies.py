from fastapi import Cookie, HTTPException, status

from app.core.config import settings
from app.core.security import decode_access_token
from app.storage.protocols import DictionaryRepository, GlossaryRepository, TMRepository
from app.storage.mongo import (
    MongoDictionaryRepository,
    MongoGlossaryRepository,
    MongoTMRepository,
)

# Singleton repository instances (database-agnostic interface; implementation depends on DATABASE_BACKEND)
_glossary_repo: GlossaryRepository | None = None
_dictionary_repo: DictionaryRepository | None = None
_tm_repo: TMRepository | None = None


def _is_sql_backend() -> bool:
    return (settings.DATABASE_BACKEND or "mongodb").strip().lower() == "sql"


def get_glossary_repository() -> GlossaryRepository:
    """Return the glossary repository (backend from DATABASE_BACKEND: mongodb or sql)."""
    global _glossary_repo
    if _glossary_repo is None:
        if _is_sql_backend():
            from app.storage.sql import SQLGlossaryRepository
            _glossary_repo = SQLGlossaryRepository()
        else:
            _glossary_repo = MongoGlossaryRepository()
    return _glossary_repo


def get_dictionary_repository() -> DictionaryRepository:
    """Return the dictionary repository (backend from DATABASE_BACKEND: mongodb or sql)."""
    global _dictionary_repo
    if _dictionary_repo is None:
        if _is_sql_backend():
            from app.storage.sql import SQLDictionaryRepository
            _dictionary_repo = SQLDictionaryRepository()
        else:
            _dictionary_repo = MongoDictionaryRepository()
    return _dictionary_repo


def get_tm_repository() -> TMRepository:
    """Return the TM repository (backend from DATABASE_BACKEND: mongodb or sql)."""
    global _tm_repo
    if _tm_repo is None:
        if _is_sql_backend():
            from app.storage.sql import SQLTMRepository
            _tm_repo = SQLTMRepository()
        else:
            _tm_repo = MongoTMRepository()
    return _tm_repo


async def get_current_user(access_token: str | None = Cookie(default=None)) -> dict:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    payload = decode_access_token(access_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return payload
