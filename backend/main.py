from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import ensure_indexes
from app.routers import ai, docs, tm
from app.services import tm_repository


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    await tm_repository.ensure_default_tm()
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
app.include_router(tm.router)
app.include_router(ai.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
