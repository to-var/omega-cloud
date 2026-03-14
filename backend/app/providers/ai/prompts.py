"""Shared prompt building for AI translation. Single source of truth for all providers."""

from app.core.languages import get_language_name


def build_translation_prompt(
    segment_source: str,
    suggested_terms: list[dict],
    target_language: str | None = None,
) -> str:
    """
    Build the system/user prompt for translating a segment with optional glossary terms.
    Used by OpenAI, Anthropic, and any other provider; keeps prompt text in one place.
    """
    parts = ["You are a professional translator. "]

    if target_language:
        lang_name = get_language_name(target_language)
        if lang_name:
            parts.append(f"Translate into {lang_name}. ")

    if suggested_terms:
        terms_lines = [
            f'  - "{t.get("source", "")}" → "{t.get("target", "")}"' for t in suggested_terms
        ]
        terms_block = (
            "Use the following approved terms in your translation where applicable:\n"
            + "\n".join(terms_lines)
            + "\n\n"
        )
        parts.append(terms_block)

    parts.append(
        "Translate the following text. Reply with only the translation, no explanation.\n\n"
    )
    parts.append(f"Text to translate:\n{segment_source}")

    return "".join(parts)
