import re

from rapidfuzz import fuzz

from app.core.config import settings
from app.services.ai_stub import get_ai_provider


def normalize(text: str) -> str:
    """Strip and collapse internal whitespace for comparison."""
    return re.sub(r"\s+", " ", text.strip())


async def find_matches(
    segments: list[dict],
    tm_pairs: list[dict],
    threshold: int | None = None,
) -> list[dict]:
    if threshold is None:
        threshold = settings.TM_FUZZY_THRESHOLD

    ai_provider = get_ai_provider()
    normalized_tm = [(normalize(p["source"]), p) for p in tm_pairs]
    results: list[dict] = []

    for seg in segments:
        source = seg["source"]
        norm_source = normalize(source)

        best_score = 0.0
        best_pair: dict | None = None

        for norm_tm_source, pair in normalized_tm:
            if norm_source == norm_tm_source:
                best_score = 100.0
                best_pair = pair
                break

            score = fuzz.ratio(norm_source, norm_tm_source)
            if score > best_score:
                best_score = score
                best_pair = pair

        if best_score == 100.0 and best_pair is not None:
            results.append({
                "index": seg["index"],
                "source": source,
                "match": {
                    "target": best_pair["target"],
                    "confidence": 100,
                    "matchType": "exact",
                    "aiSuggested": False,
                },
            })
        elif best_score >= threshold and best_pair is not None:
            results.append({
                "index": seg["index"],
                "source": source,
                "match": {
                    "target": best_pair["target"],
                    "confidence": int(best_score),
                    "matchType": "fuzzy",
                    "aiSuggested": False,
                },
            })
        else:
            context = [p["source"] for p in tm_pairs[:5]]
            ai_suggestion = await ai_provider.suggest(source, context)
            results.append({
                "index": seg["index"],
                "source": source,
                "match": {
                    "target": ai_suggestion,
                    "confidence": 0,
                    "matchType": "none",
                    "aiSuggested": True,
                },
            })

    return results
