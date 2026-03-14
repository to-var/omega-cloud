"""
Global supported languages and code → display name mapping.
Single source of truth for backend and API; frontend consumes via GET /languages.
"""

# (code, display name) — code is used in API params and seed data (e.g. "es", "fr")
SUPPORTED_LANGUAGES: list[tuple[str, str]] = [
    ("es", "Spanish"),
    ("fr", "French"),
    ("de", "German"),
    ("it", "Italian"),
    ("pt", "Portuguese"),
]

# Code → display name for prompts and UI
_LANGUAGE_NAMES: dict[str, str] = dict(SUPPORTED_LANGUAGES)


def get_language_name(code: str | None) -> str:
    """Return display name for a language code, or the code itself if unknown."""
    if not code or not code.strip():
        return ""
    return _LANGUAGE_NAMES.get(code.strip().lower(), code.strip())


def is_supported(code: str | None) -> bool:
    """Return True if the language code is in SUPPORTED_LANGUAGES."""
    if not code or not code.strip():
        return False
    return code.strip().lower() in _LANGUAGE_NAMES


def list_supported() -> list[dict[str, str]]:
    """Return list of {"code": str, "name": str} for API responses."""
    return [{"code": c, "name": n} for c, n in SUPPORTED_LANGUAGES]
