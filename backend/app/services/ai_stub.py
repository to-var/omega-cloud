from abc import ABC, abstractmethod

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    async def suggest(self, source: str, context: list[str]) -> str:
        raise NotImplementedError


class StubProvider(AIProvider):
    """Placeholder provider that returns a stub translation.

    To integrate a real AI provider:
    - Create a new class (e.g. AnthropicProvider, OpenAIProvider)
      that inherits from AIProvider
    - Implement the suggest() method using the provider's SDK
    - Register it in get_ai_provider() below
    """

    async def suggest(self, source: str, context: list[str]) -> str:
        return f"[AI_STUB] Suggested translation for: {source}"


# --- Extension point for real providers ---
#
# class AnthropicProvider(AIProvider):
#     async def suggest(self, source: str, context: list[str]) -> str:
#         import anthropic
#         client = anthropic.AsyncAnthropic()
#         message = await client.messages.create(
#             model="claude-sonnet-4-20250514",
#             messages=[{"role": "user", "content": f"Translate: {source}"}],
#         )
#         return message.content[0].text
#
# class OpenAIProvider(AIProvider):
#     async def suggest(self, source: str, context: list[str]) -> str:
#         import openai
#         client = openai.AsyncOpenAI()
#         response = await client.chat.completions.create(
#             model="gpt-4o",
#             messages=[{"role": "user", "content": f"Translate: {source}"}],
#         )
#         return response.choices[0].message.content


def get_ai_provider() -> AIProvider:
    """Factory that returns the configured AI provider."""
    provider = settings.AI_PROVIDER.lower()

    if provider == "stub":
        return StubProvider()
    # elif provider == "anthropic":
    #     return AnthropicProvider()
    # elif provider == "openai":
    #     return OpenAIProvider()
    else:
        raise ValueError(f"Unknown AI_PROVIDER: {provider}")
