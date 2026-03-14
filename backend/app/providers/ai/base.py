"""Protocol for AI translation providers. Engine-agnostic."""

from abc import ABC, abstractmethod


class AITranslationProvider(ABC):
    """Interface for any AI-backed translation engine (OpenAI, Anthropic, Ollama, etc.)."""

    @abstractmethod
    async def translate_with_terms(
        self,
        segment_source: str,
        suggested_terms: list[dict],
        target_language: str | None = None,
    ) -> str:
        """
        Translate segment_source, applying suggested_terms (list of {"source", "target"}).
        target_language: optional ISO code (e.g. es, fr) for the translation target.
        Returns the translation only, no explanation.
        """
        ...

    @abstractmethod
    async def suggest(self, source: str, context: list[str]) -> str:
        """
        Suggest a translation for source with optional context (e.g. other source strings).
        Used when no TM match is found.
        """
        ...
