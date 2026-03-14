"""
ORM and database session. Database-agnostic: use DATABASE_BACKEND=sql with
DATABASE_URL (e.g. sqlite+aiosqlite or postgresql+asyncpg) for SQL, or
DATABASE_BACKEND=mongodb for MongoDB (no ORM).
"""

from app.db.base import Base
from app.db.session import init_db

__all__ = ["Base", "init_db"]
