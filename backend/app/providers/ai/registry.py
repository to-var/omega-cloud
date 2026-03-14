"""
Registry for AI translation providers. Add new engines by implementing AITranslationProvider
and registering in PROVIDERS. Config: AI_PROVIDER=<name>, plus provider-specific env vars.
"""

from app.core.config import settings
from app.providers.ai.base import AITranslationProvider
from app.providers.ai.openai_provider import OpenAIProvider
from app.providers.ai.anthropic_provider import AnthropicProvider

# Map AI_PROVIDER value to provider class. Add new engines here.
PROVIDERS: dict[str, type[AITranslationProvider]] = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
}


def get_ai_provider() -> AITranslationProvider:
    """Return the configured AI translation provider. Raises ValueError if misconfigured."""
    name = (settings.AI_PROVIDER or "openai").strip().lower()
    if name not in PROVIDERS:
        available = ", ".join(sorted(PROVIDERS.keys()))
        raise ValueError(
            f"Unknown AI_PROVIDER: {name}. Choose one of: {available}. "
            "Set the matching API key in .env (e.g. OPENAI_API_KEY or ANTHROPIC_API_KEY)."
        )
    return PROVIDERS[name]()
