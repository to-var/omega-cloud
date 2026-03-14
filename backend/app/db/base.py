"""SQLAlchemy declarative base and shared model helpers."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base for all ORM models. Database-agnostic (works with SQLite, PostgreSQL, etc.)."""
    pass
