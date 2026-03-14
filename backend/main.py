from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import ensure_indexes
from app.core.dependencies import (
    get_dictionary_repository,
    get_glossary_repository,
    get_tm_repository,
)
from app.routers import ai, docs, dictionary, glossary, languages, tm


def _is_sql_backend() -> bool:
    return (getattr(settings, "DATABASE_BACKEND", None) or "mongodb").strip().lower() == "sql"


@asynccontextmanager
async def lifespan(app: FastAPI):
    if _is_sql_backend():
        from app.db.session import init_db
        await init_db()
    else:
        await ensure_indexes()
    await get_tm_repository().ensure_seeded()
    await get_glossary_repository().ensure_seeded()
    await get_dictionary_repository().ensure_seeded()
    yield


app = FastAPI(
    title="OmegaWeb API",
    description="Cloud-native translation memory assistant",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(docs.router)
app.include_router(languages.router)
app.include_router(tm.router)
app.include_router(glossary.router)
app.include_router(dictionary.router)
app.include_router(ai.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
