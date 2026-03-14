from abc import ABC, abstractmethod

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    async def suggest(self, source: str, context: list[str]) -> str:
        raise NotImplementedError

    @abstractmethod
    async def translate_with_terms(
        self, segment_source: str, suggested_terms: list[dict]
    ) -> str:
        raise NotImplementedError


class OpenAIProvider(AIProvider):
    """OpenAI-based provider for translation with optional glossary terms."""

    def __init__(self) -> None:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when AI_PROVIDER=openai")

    async def suggest(self, source: str, context: list[str]) -> str:
        return await self.translate_with_terms(
            source, [{"source": c, "target": ""} for c in context[:10]]
        )

    async def translate_with_terms(
        self, segment_source: str, suggested_terms: list[dict]
    ) -> str:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        terms_block = ""
        if suggested_terms:
            terms_lines = [
                f'  - "{t["source"]}" → "{t["target"]}"'
                for t in suggested_terms
            ]
            terms_block = (
                "Use the following approved terms in your translation where applicable:\n"
                + "\n".join(terms_lines)
                + "\n\n"
            )
        prompt = (
            "You are a professional translator. "
            + terms_block
            + "Translate the following text. Reply with only the translation, no explanation.\n\n"
            f"Text to translate:\n{segment_source}"
        )
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        content = response.choices[0].message.content
        return (content or "").strip()


def get_ai_provider() -> AIProvider:
    """Factory that returns the configured AI provider (OpenAI)."""
    provider = settings.AI_PROVIDER.lower()
    if provider == "openai":
        return OpenAIProvider()
    raise ValueError(
        f"Unknown AI_PROVIDER: {provider}. Set AI_PROVIDER=openai and OPENAI_API_KEY."
    )
