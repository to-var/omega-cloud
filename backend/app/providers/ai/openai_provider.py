"""OpenAI-based AI translation provider."""

from app.core.config import settings
from app.providers.ai.base import AITranslationProvider
from app.providers.ai.prompts import build_translation_prompt


class OpenAIProvider(AITranslationProvider):
    """Translation via OpenAI Chat Completions (e.g. gpt-4o-mini)."""

    def __init__(self) -> None:
        key = getattr(settings, "OPENAI_API_KEY", "") or ""
        if not key.strip():
            raise ValueError(
                "OPENAI_API_KEY is required when AI_PROVIDER=openai. Set it in .env."
            )

    async def translate_with_terms(
        self,
        segment_source: str,
        suggested_terms: list[dict],
        target_language: str | None = None,
    ) -> str:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        prompt = build_translation_prompt(
            segment_source, suggested_terms, target_language
        )
        model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini") or "gpt-4o-mini"
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
        )
        content = response.choices[0].message.content
        return (content or "").strip()

    async def suggest(self, source: str, context: list[str]) -> str:
        return await self.translate_with_terms(
            source, [{"source": c, "target": ""} for c in context[:10]]
        )
