"""ORM models for glossary, dictionary, and translation memory. Database-agnostic (any SQL)."""

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GlossaryEntry(Base):
    __tablename__ = "glossary"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(512), nullable=False)
    target: Mapped[str] = mapped_column(String(512), nullable=False)
    target_language: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    def to_dict(self) -> dict:
        return {"source": self.source, "target": self.target, "target_language": self.target_language or ""}


class DictionaryEntry(Base):
    __tablename__ = "dictionary"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    term: Mapped[str] = mapped_column(String(512), nullable=False)
    definition: Mapped[str] = mapped_column(Text, nullable=False)
    target_language: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    def to_dict(self) -> dict:
        return {"term": self.term, "definition": self.definition, "target_language": self.target_language or ""}


class TranslationMemory(Base):
    __tablename__ = "translation_memories"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tm_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    source_language: Mapped[str | None] = mapped_column(String(16), nullable=True)
    target_language: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    pairs: Mapped[list["TranslationPair"]] = relationship(
        "TranslationPair",
        back_populates="tm",
        cascade="all, delete-orphan",
        order_by="TranslationPair.id",
    )


class TranslationPair(Base):
    __tablename__ = "translation_pairs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tm_id: Mapped[int] = mapped_column(ForeignKey("translation_memories.id", ondelete="CASCADE"), nullable=False)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    target: Mapped[str] = mapped_column(Text, nullable=False)

    tm: Mapped["TranslationMemory"] = relationship("TranslationMemory", back_populates="pairs")
