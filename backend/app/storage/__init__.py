"""
Storage interfaces (protocols) for glossary, dictionary, and translation memories.
Implementations are database-specific (e.g. MongoDB); the app depends on these
interfaces so the backing store can be swapped without changing API or business logic.
"""

from app.storage.protocols import (
    DictionaryRepository,
    GlossaryRepository,
    TMRepository,
)

__all__ = [
    "DictionaryRepository",
    "GlossaryRepository",
    "TMRepository",
]
