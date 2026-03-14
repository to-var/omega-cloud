"""Anthropic (Claude) AI translation provider."""

from app.core.config import settings
from app.providers.ai.base import AITranslationProvider
from app.providers.ai.prompts import build_translation_prompt


class AnthropicProvider(AITranslationProvider):
    """Translation via Anthropic Messages API (Claude)."""

    def __init__(self) -> None:
        key = getattr(settings, "ANTHROPIC_API_KEY", "") or ""
        if not key.strip():
            raise ValueError(
                "ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic. Set it in .env."
            )

    async def translate_with_terms(
        self,
        segment_source: str,
        suggested_terms: list[dict],
        target_language: str | None = None,
    ) -> str:
        from anthropic import AsyncAnthropic

        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        prompt = build_translation_prompt(
            segment_source, suggested_terms, target_language
        )
        model = getattr(settings, "ANTHROPIC_MODEL", "claude-3-5-haiku-20241022") or "claude-3-5-haiku-20241022"
        response = await client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        if not response.content or response.content[0].type != "text":
            return ""
        return (response.content[0].text or "").strip()

    async def suggest(self, source: str, context: list[str]) -> str:
        return await self.translate_with_terms(
            source, [{"source": c, "target": ""} for c in context[:10]], target_language=None
        )
