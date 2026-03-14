"""
Database-agnostic storage protocols. Any backend (MongoDB, PostgreSQL, etc.)
can implement these interfaces; the API layer depends only on the protocol.
"""

from typing import Protocol, runtime_checkable


@runtime_checkable
class GlossaryRepository(Protocol):
    """Glossary storage: source → target term pairs."""

    async def get_all_entries(self, target_language: str | None = None) -> list[dict]:
        """Return glossary entries (source, target, target_language). Filter by target_language if given."""
        ...

    async def ensure_seeded(self) -> None:
        """If empty, load seed data (e.g. from JSON) and insert. No-op if already populated."""
        ...


@runtime_checkable
class DictionaryRepository(Protocol):
    """Dictionary storage: term → definition."""

    async def get_all_entries(self, target_language: str | None = None) -> list[dict]:
        """Return dictionary entries (term, definition, target_language). Filter by target_language if given."""
        ...

    async def ensure_seeded(self) -> None:
        """If empty, load seed data (e.g. from JSON) and insert. No-op if already populated."""
        ...


@runtime_checkable
class TMRepository(Protocol):
    """Translation memory storage."""

    async def list_tms(self, target_language: str | None = None) -> list[dict]:
        """List TMs (tm_id, source_language, target_language, unit_count, etc.). Filter by target_language if given."""
        ...

    async def get_parsed(self, tm_id: str) -> list[dict]:
        """Return parsed translation pairs for the given TM. Raises LookupError if not found."""
        ...

    async def create_tm(
        self,
        tm_id: str,
        source_language: str | None,
        target_language: str | None,
        pairs: list[dict],
    ) -> None:
        """Create a new TM."""
        ...

    async def ensure_seeded(self) -> None:
        """If no TMs exist, load seed data (e.g. from JSON) and insert. No-op otherwise."""
        ...
