"""
AI translation providers. Engine-agnostic: the app depends on the AITranslationProvider
protocol; implementations (OpenAI, Anthropic, Ollama, etc.) are registered by name.
"""

from app.providers.ai.base import AITranslationProvider
from app.providers.ai.registry import get_ai_provider

__all__ = ["AITranslationProvider", "get_ai_provider"]
